#!/bin/bash

# Vantedge Health - GKE Cluster Creation Script
# Creates a production-ready GKE cluster with best practices

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="${GCP_REGION:-us-central1}"
CLUSTER_NAME="${GKE_CLUSTER_NAME:-vantedge-health-cluster}"
MACHINE_TYPE="${MACHINE_TYPE:-e2-standard-2}"
MIN_NODES="${MIN_NODES:-3}"
MAX_NODES="${MAX_NODES:-10}"

echo -e "${GREEN}=== Creating GKE Cluster for Vantedge Health ===${NC}"
echo ""

# Validate environment variables
if [ "$PROJECT_ID" = "your-project-id" ]; then
    echo -e "${RED}Error: Please set GCP_PROJECT_ID environment variable${NC}"
    exit 1
fi

echo "Configuration:"
echo "  Project ID: ${PROJECT_ID}"
echo "  Region: ${REGION}"
echo "  Cluster Name: ${CLUSTER_NAME}"
echo "  Machine Type: ${MACHINE_TYPE}"
echo "  Node Pool: ${MIN_NODES}-${MAX_NODES} nodes"
echo ""

read -p "Proceed with cluster creation? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Cluster creation cancelled."
    exit 0
fi

echo -e "${YELLOW}Creating GKE cluster...${NC}"
gcloud container clusters create ${CLUSTER_NAME} \
    --project=${PROJECT_ID} \
    --region=${REGION} \
    --machine-type=${MACHINE_TYPE} \
    --num-nodes=1 \
    --enable-autoscaling \
    --min-nodes=${MIN_NODES} \
    --max-nodes=${MAX_NODES} \
    --enable-autorepair \
    --enable-autoupgrade \
    --enable-ip-alias \
    --network=default \
    --subnetwork=default \
    --enable-stackdriver-kubernetes \
    --addons=HorizontalPodAutoscaling,HttpLoadBalancing,GcePersistentDiskCsiDriver \
    --workload-pool=${PROJECT_ID}.svc.id.goog \
    --enable-shielded-nodes \
    --shielded-secure-boot \
    --shielded-integrity-monitoring \
    --release-channel=regular

echo -e "${GREEN}Cluster created successfully!${NC}"
echo ""

# Create spot (preemptible) node pool for stateless workloads
echo -e "${YELLOW}Creating spot node pool for cost optimization...${NC}"
gcloud container node-pools create spot-pool \
    --cluster=${CLUSTER_NAME} \
    --project=${PROJECT_ID} \
    --region=${REGION} \
    --machine-type=${MACHINE_TYPE} \
    --spot \
    --num-nodes=1 \
    --enable-autoscaling \
    --min-nodes=2 \
    --max-nodes=${MAX_NODES} \
    --enable-autorepair \
    --enable-autoupgrade \
    --node-labels=node-type=spot,workload-type=stateless \
    --node-taints=spot-instance=true:PreferNoSchedule \
    --shielded-secure-boot \
    --shielded-integrity-monitoring

echo -e "${GREEN}Spot node pool created successfully!${NC}"
echo ""

echo -e "${YELLOW}Getting cluster credentials...${NC}"
gcloud container clusters get-credentials ${CLUSTER_NAME} --region=${REGION} --project=${PROJECT_ID}

echo -e "${YELLOW}Verifying cluster access...${NC}"
kubectl cluster-info
kubectl get nodes

echo ""
echo -e "${GREEN}=== Cluster Setup Complete! ===${NC}"
echo ""
echo "Next steps:"
echo "1. Run the deployment script: ./scripts/deploy-to-gke.sh"
echo "2. Reserve a static IP: gcloud compute addresses create vantedge-health-ip --global"
echo "3. Update DNS records to point to the static IP"
