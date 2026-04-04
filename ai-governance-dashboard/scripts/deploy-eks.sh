#!/bin/bash

# AI Governance Dashboard - AWS EKS Deployment Script
# Usage: ./scripts/deploy-eks.sh [environment] [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-production}
CLUSTER_NAME=${2:-ai-governance-cluster}
REGION=${3:-us-west-2}
NAMESPACE="ai-governance"
HELM_RELEASE_NAME="ai-governance-dashboard"
ECR_REPOSITORY=""
IMAGE_TAG="latest"
DRY_RUN=${4:-false}

echo -e "${BLUE}🚀 AI Governance Dashboard - EKS Deployment${NC}"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}Cluster: $CLUSTER_NAME${NC}"
echo -e "${BLUE}Region: $REGION${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
        exit 1
    fi
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        exit 1
    fi
    
    # Check Helm
    if ! command -v helm &> /dev/null; then
        print_error "Helm is not installed"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured"
        exit 1
    fi
    
    print_status "Prerequisites check completed"
}

# Configure kubectl for EKS
configure_kubectl() {
    echo -e "${BLUE}⚙️  Configuring kubectl for EKS...${NC}"
    
    aws eks update-kubeconfig --region $REGION --name $CLUSTER_NAME
    
    # Verify connection
    if kubectl cluster-info &> /dev/null; then
        print_status "kubectl configured successfully"
        kubectl get nodes
    else
        print_error "Failed to connect to EKS cluster"
        exit 1
    fi
}

# Get ECR repository URI
get_ecr_repository() {
    echo -e "${BLUE}🐳 Getting ECR repository...${NC}"
    
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    ECR_REPOSITORY="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/ai-governance-dashboard"
    
    # Check if repository exists
    if aws ecr describe-repositories --repository-names ai-governance-dashboard --region $REGION &> /dev/null; then
        print_status "ECR repository exists: $ECR_REPOSITORY"
    else
        print_warning "ECR repository does not exist, creating..."
        aws ecr create-repository --repository-name ai-governance-dashboard --region $REGION
        print_status "ECR repository created: $ECR_REPOSITORY"
    fi
}

# Build and push Docker image
build_and_push_image() {
    echo -e "${BLUE}🏗️  Building and pushing Docker image...${NC}"
    
    # Generate image tag
    IMAGE_TAG="$(date +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD 2>/dev/null || echo 'latest')"
    
    # Build image
    docker build -t ai-governance-dashboard:$IMAGE_TAG .
    
    # Tag for ECR
    docker tag ai-governance-dashboard:$IMAGE_TAG $ECR_REPOSITORY:$IMAGE_TAG
    docker tag ai-governance-dashboard:$IMAGE_TAG $ECR_REPOSITORY:latest
    
    # Login to ECR
    aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY
    
    # Push images
    docker push $ECR_REPOSITORY:$IMAGE_TAG
    docker push $ECR_REPOSITORY:latest
    
    print_status "Image pushed: $ECR_REPOSITORY:$IMAGE_TAG"
}

# Install AWS Load Balancer Controller (if not exists)
install_alb_controller() {
    echo -e "${BLUE}🔧 Checking AWS Load Balancer Controller...${NC}"
    
    if kubectl get deployment -n kube-system aws-load-balancer-controller &> /dev/null; then
        print_status "AWS Load Balancer Controller already installed"
        return
    fi
    
    print_warning "Installing AWS Load Balancer Controller..."
    
    # Create IAM role for service account
    eksctl create iamserviceaccount \
        --cluster=$CLUSTER_NAME \
        --namespace=kube-system \
        --name=aws-load-balancer-controller \
        --role-name "AmazonEKSLoadBalancerControllerRole" \
        --attach-policy-arn=arn:aws:iam::aws:policy/ElasticLoadBalancingFullAccess \
        --approve \
        --override-existing-serviceaccounts \
        --region $REGION || true
    
    # Add Helm repository
    helm repo add eks https://aws.github.io/eks-charts
    helm repo update
    
    # Install controller
    helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
        -n kube-system \
        --set clusterName=$CLUSTER_NAME \
        --set serviceAccount.create=false \
        --set serviceAccount.name=aws-load-balancer-controller \
        --set region=$REGION \
        --set vpcId=$(aws eks describe-cluster --name $CLUSTER_NAME --region $REGION --query "cluster.resourcesVpcConfig.vpcId" --output text)
    
    print_status "AWS Load Balancer Controller installed"
}

# Deploy using Helm
deploy_with_helm() {
    echo -e "${BLUE}🚢 Deploying with Helm...${NC}"
    
    # Create values file for environment
    cat > values-$ENVIRONMENT.yaml << EOF
image:
  repository: $ECR_REPOSITORY
  tag: $IMAGE_TAG

ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/healthcheck-path: /health
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/ssl-redirect: '443'
  hosts:
    - host: ai-governance-$ENVIRONMENT.yourdomain.com
      paths:
        - path: /
          pathType: Prefix

env:
  NODE_ENV: $ENVIRONMENT
  REACT_APP_ENV: $ENVIRONMENT

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: $([ "$ENVIRONMENT" = "production" ] && echo "3" || echo "2")
  maxReplicas: $([ "$ENVIRONMENT" = "production" ] && echo "10" || echo "5")

# Spot instance scheduling for cost optimization
spotInstances:
  enabled: true
  taintEffect: PreferNoSchedule

tolerations:
  - key: "spot-instance"
    operator: "Equal"
    value: "true"
    effect: "PreferNoSchedule"

affinity:
  nodeAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 90
      preference:
        matchExpressions:
        - key: node-type
          operator: In
          values:
          - spot
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app.kubernetes.io/name
            operator: In
            values:
            - ai-governance-dashboard
        topologyKey: kubernetes.io/hostname
EOF

    # Deploy or upgrade
    if [ "$DRY_RUN" = "true" ]; then
        echo -e "${YELLOW}🔍 Dry run mode - showing what would be deployed:${NC}"
        helm upgrade --install $HELM_RELEASE_NAME ./helm \
            --namespace $NAMESPACE \
            --create-namespace \
            --values values-$ENVIRONMENT.yaml \
            --dry-run --debug
    else
        helm upgrade --install $HELM_RELEASE_NAME ./helm \
            --namespace $NAMESPACE \
            --create-namespace \
            --values values-$ENVIRONMENT.yaml \
            --wait --timeout=10m
        
        print_status "Helm deployment completed"
    fi
}

# Deploy using kubectl (alternative method)
deploy_with_kubectl() {
    echo -e "${BLUE}🚢 Deploying with kubectl...${NC}"
    
    # Update image in deployment
    sed -i.bak "s|image: ai-governance-dashboard:latest|image: $ECR_REPOSITORY:$IMAGE_TAG|g" k8s/deployment.yaml
    
    if [ "$DRY_RUN" = "true" ]; then
        echo -e "${YELLOW}🔍 Dry run mode - showing what would be deployed:${NC}"
        kubectl apply -f k8s/ --dry-run=client
    else
        # Apply manifests
        kubectl apply -f k8s/
        
        # Wait for deployment
        kubectl rollout status deployment/ai-governance-dashboard -n $NAMESPACE --timeout=600s
        
        print_status "kubectl deployment completed"
    fi
    
    # Restore original file
    mv k8s/deployment.yaml.bak k8s/deployment.yaml
}

# Verify deployment
verify_deployment() {
    if [ "$DRY_RUN" = "true" ]; then
        return
    fi
    
    echo -e "${BLUE}🔍 Verifying deployment...${NC}"
    
    # Check pods
    echo "Checking pods..."
    kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=ai-governance-dashboard
    
    # Check services
    echo "Checking services..."
    kubectl get services -n $NAMESPACE
    
    # Check ingress
    echo "Checking ingress..."
    kubectl get ingress -n $NAMESPACE
    
    # Wait for pods to be ready
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=ai-governance-dashboard -n $NAMESPACE --timeout=300s
    
    # Get load balancer URL
    if kubectl get ingress -n $NAMESPACE ai-governance-dashboard &> /dev/null; then
        LB_URL=$(kubectl get ingress -n $NAMESPACE ai-governance-dashboard -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
        if [ ! -z "$LB_URL" ]; then
            echo -e "${GREEN}🌐 Application URL: http://$LB_URL${NC}"
        fi
    fi
    
    print_status "Deployment verification completed"
}

# Health check
health_check() {
    if [ "$DRY_RUN" = "true" ]; then
        return
    fi
    
    echo -e "${BLUE}🏥 Running health check...${NC}"
    
    # Port forward for health check
    kubectl port-forward -n $NAMESPACE svc/ai-governance-dashboard 8080:80 &
    PF_PID=$!
    
    sleep 5
    
    # Check health endpoint
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        print_status "Health check passed"
    else
        print_warning "Health check failed - application may still be starting"
    fi
    
    # Clean up port forward
    kill $PF_PID 2>/dev/null || true
}

# Cleanup function
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up...${NC}"
    
    # Remove temporary files
    rm -f values-$ENVIRONMENT.yaml
    
    print_status "Cleanup completed"
}

# Main deployment flow
main() {
    echo -e "${BLUE}🎯 Starting EKS deployment process...${NC}"
    
    check_prerequisites
    configure_kubectl
    get_ecr_repository
    
    if [ "$DRY_RUN" != "true" ]; then
        build_and_push_image
        install_alb_controller
    fi
    
    # Choose deployment method
    if [ -d "helm" ]; then
        deploy_with_helm
    else
        deploy_with_kubectl
    fi
    
    verify_deployment
    health_check
    cleanup
    
    echo -e "${GREEN}🎉 EKS deployment completed successfully!${NC}"
    
    # Print access information
    echo -e "${BLUE}📋 Access Information:${NC}"
    echo -e "  🌐 Application URL: Check ingress for load balancer URL"
    echo -e "  👤 Demo Credentials:"
    echo -e "    Developer: developer@demo.com / demo123"
    echo -e "    DPO: dpo@demo.com / demo123"
    echo -e "    Executive: executive@demo.com / demo123"
    echo -e "  🔧 Useful Commands:"
    echo -e "    kubectl get pods -n $NAMESPACE"
    echo -e "    kubectl logs -f deployment/ai-governance-dashboard -n $NAMESPACE"
    echo -e "    kubectl get ingress -n $NAMESPACE"
}

# Handle script arguments
case $1 in
    "help"|"-h"|"--help")
        echo "AI Governance Dashboard - EKS Deployment Script"
        echo ""
        echo "Usage: $0 [environment] [cluster-name] [region] [dry-run]"
        echo ""
        echo "Arguments:"
        echo "  environment    Deployment environment (development|staging|production)"
        echo "  cluster-name   EKS cluster name (default: ai-governance-cluster)"
        echo "  region         AWS region (default: us-west-2)"
        echo "  dry-run        Dry run mode (true|false)"
        echo ""
        echo "Examples:"
        echo "  $0 production"
        echo "  $0 staging my-cluster us-east-1"
        echo "  $0 development my-cluster us-west-2 true"
        echo ""
        echo "Prerequisites:"
        echo "  - AWS CLI configured with appropriate permissions"
        echo "  - kubectl installed"
        echo "  - Helm installed"
        echo "  - Docker installed"
        echo "  - EKS cluster already created"
        exit 0
        ;;
    *)
        main
        ;;
esac