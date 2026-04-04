/**
 * AI Compliance Dashboard - Enhanced with Executive Features
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  Shield as ShieldIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  BarChart as ExecutiveIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../contexts/ApiContext';

// Simple StatCard for standard dashboard
function SimpleStatCard({ title, value, icon, color = 'primary', subtitle }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ color: `${color}.main`, mr: 2 }}>
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" gutterBottom>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

// Enhanced StatCard for executive dashboard
function StatCard({ title, value, icon, color = 'primary', subtitle, trend, trendValue }) {
  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: `${color}.main`, mr: 2, width: 48, height: 48 }}>
              {icon}
            </Avatar>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          </Box>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {trend === 'up' ? (
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20 }} />
              ) : (
                <TrendingDownIcon sx={{ color: 'error.main', fontSize: 20 }} />
              )}
              <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 'bold' }}>
                {trendValue}
              </Typography>
            </Box>
          )}
        </Box>
        <Typography variant="h3" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function ExecutiveMetricCard({ title, metrics, icon, color = 'primary' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ bgcolor: `${color}.main`, mr: 2, width: 48, height: 48 }}>
            {icon}
          </Avatar>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {metrics.map((metric, index) => (
            <Box key={index}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {metric.label}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {metric.value}
                </Typography>
              </Box>
              {metric.progress !== undefined && (
                <LinearProgress
                  variant="determinate"
                  value={metric.progress}
                  color={metric.progress >= 80 ? 'success' : metric.progress >= 60 ? 'warning' : 'error'}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              )}
              {index < metrics.length - 1 && <Divider sx={{ mt: 1 }} />}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

function RiskAssessmentCard({ risks }) {
  const getRiskColor = (level) => {
    switch (level.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getRiskIcon = (level) => {
    switch (level.toLowerCase()) {
      case 'high': return <WarningIcon />;
      case 'medium': return <SpeedIcon />;
      case 'low': return <CheckCircleIcon />;
      default: return <AssessmentIcon />;
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ bgcolor: 'warning.main', mr: 2, width: 48, height: 48 }}>
            <ShieldIcon />
          </Avatar>
          <Typography variant="h6" component="div">
            Risk Assessment
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {risks.map((risk, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <Box sx={{ color: `${getRiskColor(risk.level)}.main`, mr: 2 }}>
                  {getRiskIcon(risk.level)}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {risk.category}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {risk.description}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={risk.level.toUpperCase()}
                color={getRiskColor(risk.level)}
                size="small"
                sx={{ minWidth: 60 }}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

// Simple ComplianceScoreCard for standard dashboard
function SimpleComplianceScoreCard({ score, status }) {
  const getScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant':
        return 'success';
      case 'needs_attention':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TrendingUpIcon sx={{ color: 'primary.main', mr: 2 }} />
          <Typography variant="h6" component="div">
            Compliance Score
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="div" sx={{ mr: 2 }}>
            {score}%
          </Typography>
          <Chip
            label={status.replace('_', ' ').toUpperCase()}
            color={getStatusColor(status)}
            size="small"
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={score}
          color={getScoreColor(score)}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </CardContent>
    </Card>
  );
}

function ComplianceScoreCard({ score, status }) {
  const getScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant':
        return 'success';
      case 'needs_attention':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getScoreGrade = (score) => {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 65) return 'D+';
    if (score >= 60) return 'D';
    return 'F';
  };

  return (
    <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 48, height: 48 }}>
            <AnalyticsIcon />
          </Avatar>
          <Typography variant="h6" component="div" sx={{ color: 'white' }}>
            Compliance Score
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', color: 'white' }}>
              {score}%
            </Typography>
            <Typography variant="h4" sx={{ opacity: 0.9 }}>
              Grade: {getScoreGrade(score)}
            </Typography>
          </Box>
          <Chip
            label={status.replace('_', ' ').toUpperCase()}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              fontWeight: 'bold'
            }}
            size="medium"
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={score}
          sx={{ 
            height: 12, 
            borderRadius: 6,
            bgcolor: 'rgba(255,255,255,0.2)',
            '& .MuiLinearProgress-bar': {
              bgcolor: 'rgba(255,255,255,0.9)'
            }
          }}
        />
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
          {score >= 90 ? 'Excellent compliance posture' : 
           score >= 70 ? 'Good compliance with room for improvement' : 
           'Immediate attention required'}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { getDashboardData } = useApi();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('executive');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const result = await getDashboardData();
    
    if (result.success) {
      setDashboardData(result.data);
      setError('');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const getExecutiveMetrics = () => {
    const isRegulatory = user?.role === 'regulatory_inspector';
    
    if (isRegulatory) {
      return {
        performanceMetrics: [
          { label: 'Avg Response Time', value: '2.3 days', progress: 85 },
          { label: 'Assessment Quality', value: '94%', progress: 94 },
          { label: 'Regulatory Coverage', value: '87%', progress: 87 }
        ],
        industryMetrics: [
          { label: 'Financial Services', value: '23 orgs', progress: 92 },
          { label: 'Healthcare', value: '18 orgs', progress: 88 },
          { label: 'Automotive', value: '12 orgs', progress: 85 },
          { label: 'Government', value: '8 orgs', progress: 90 }
        ],
        riskAssessment: [
          { category: 'Data Privacy', level: 'Low', description: 'Strong GDPR compliance across sectors' },
          { category: 'AI Bias', level: 'Medium', description: 'Some models need bias testing' },
          { category: 'Regulatory Changes', level: 'High', description: 'New EU AI Act requirements' }
        ]
      };
    } else {
      return {
        performanceMetrics: [
          { label: 'Model Accuracy', value: '96.2%', progress: 96 },
          { label: 'Response Time', value: '1.2s', progress: 88 },
          { label: 'Uptime', value: '99.9%', progress: 99 }
        ],
        complianceMetrics: [
          { label: 'PII Protection', value: '98%', progress: 98 },
          { label: 'Bias Detection', value: '92%', progress: 92 },
          { label: 'Audit Readiness', value: '89%', progress: 89 },
          { label: 'Policy Adherence', value: '95%', progress: 95 }
        ],
        riskAssessment: [
          { category: 'Data Exposure', level: 'Low', description: 'All PII properly masked' },
          { category: 'Model Drift', level: 'Medium', description: 'Monitor for performance degradation' },
          { category: 'Regulatory Compliance', level: 'Low', description: 'All requirements met' }
        ]
      };
    }
  };

  if (loading) {
    return (
      <Box className="main-content" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="main-content">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const isRegulatory = user?.role === 'regulatory_inspector';
  const metrics = getExecutiveMetrics();

  const renderStandardDashboard = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        {isRegulatory ? 'Regulatory Dashboard' : 'Compliance Dashboard'}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
        {isRegulatory 
          ? 'Monitor compliance across all organizations under your jurisdiction'
          : 'Monitor your organization\'s AI compliance status and performance'
        }
      </Typography>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {isRegulatory ? (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <SimpleStatCard
                title="Total Organizations"
                value={dashboardData?.total_organizations || 0}
                icon={<BusinessIcon />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SimpleStatCard
                title="Total Assessments"
                value={dashboardData?.total_assessments || 0}
                icon={<AssessmentIcon />}
                color="secondary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SimpleStatCard
                title="Completed Assessments"
                value={dashboardData?.completed_assessments || 0}
                icon={<AssessmentIcon />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SimpleStatCard
                title="Compliance Rate"
                value={`${Math.round(dashboardData?.compliance_rate || 0)}%`}
                icon={<TrendingUpIcon />}
                color="info"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Assessments
                  </Typography>
                  {dashboardData?.recent_assessments?.length > 0 ? (
                    <List>
                      {dashboardData.recent_assessments.map((assessment, index) => (
                        <ListItem key={index} divider>
                          <ListItemText
                            primary={`${assessment.organization_name} - ${assessment.assessment_type.toUpperCase()} Assessment`}
                            secondary={`Status: ${assessment.status} | Industry: ${assessment.industry_profile} | Created: ${new Date(assessment.created_at).toLocaleDateString()}`}
                          />
                          <Chip
                            label={assessment.status.replace('_', ' ').toUpperCase()}
                            color={assessment.status === 'completed' ? 'success' : 'default'}
                            size="small"
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary">No recent assessments</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <SimpleStatCard
                title="Total Assessments"
                value={dashboardData?.total_assessments || 0}
                icon={<AssessmentIcon />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SimpleStatCard
                title="Completed Assessments"
                value={dashboardData?.completed_assessments || 0}
                icon={<AssessmentIcon />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SimpleComplianceScoreCard
                score={dashboardData?.average_compliance_score || 0}
                status={dashboardData?.compliance_status || 'unknown'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SimpleStatCard
                title="Recent Violations"
                value={dashboardData?.recent_violations || 0}
                icon={<SecurityIcon />}
                color="error"
                subtitle="Last 7 days"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Compliance Status
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Current Status: 
                      <Chip
                        label={dashboardData?.compliance_status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                        color={dashboardData?.compliance_status === 'compliant' ? 'success' : 'warning'}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Average Score: {dashboardData?.average_compliance_score || 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dashboardData?.compliance_status === 'compliant' 
                        ? 'Your organization is meeting compliance requirements.'
                        : 'Some areas need attention to maintain compliance.'
                      }
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Guardrail Violations (7 days): {dashboardData?.recent_violations || 0}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Assessments in Progress: {(dashboardData?.total_assessments || 0) - (dashboardData?.completed_assessments || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Keep monitoring your compliance metrics regularly.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );

  const renderExecutiveDashboard = () => (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {isRegulatory ? 'Regulatory Command Center' : 'Executive Dashboard'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {isRegulatory 
            ? 'Comprehensive oversight of AI compliance across all regulated organizations'
            : 'Strategic overview of your organization\'s AI compliance and performance metrics'
          }
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Chip 
            icon={<TimelineIcon />}
            label={`Last Updated: ${new Date().toLocaleString()}`}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          />
          <Chip 
            icon={<VisibilityIcon />}
            label={isRegulatory ? 'Multi-Org View' : 'Organization View'}
            color="primary"
            size="small"
          />
        </Box>
      </Box>

      <Grid container spacing={2}>
        {isRegulatory ? (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Organizations"
                value={dashboardData?.total_organizations || 0}
                icon={<BusinessIcon />}
                color="primary"
                trend="up"
                trendValue="+3 this month"
                subtitle="Under supervision"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Assessments"
                value={dashboardData?.total_assessments || 0}
                icon={<AssignmentIcon />}
                color="secondary"
                trend="up"
                trendValue="+12%"
                subtitle="In progress"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Compliance Rate"
                value={`${Math.round(dashboardData?.compliance_rate || 0)}%`}
                icon={<CheckCircleIcon />}
                color="success"
                trend="up"
                trendValue="+5.2%"
                subtitle="Industry average: 78%"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Critical Issues"
                value="3"
                icon={<WarningIcon />}
                color="error"
                trend="down"
                trendValue="-2 this week"
                subtitle="Require immediate attention"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <ExecutiveMetricCard
                title="Regulatory Performance"
                metrics={metrics.performanceMetrics}
                icon={<SpeedIcon />}
                color="info"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <ExecutiveMetricCard
                title="Industry Coverage"
                metrics={metrics.industryMetrics}
                icon={<BusinessIcon />}
                color="secondary"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <RiskAssessmentCard risks={metrics.riskAssessment} />
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6">
                      Recent Assessment Activity
                    </Typography>
                    <Tooltip title="View all assessments">
                      <IconButton>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  {dashboardData?.recent_assessments?.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Organization</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Industry</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Score</TableCell>
                            <TableCell>Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dashboardData.recent_assessments.slice(0, 5).map((assessment, index) => (
                            <TableRow key={index} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  {assessment.organization_name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={assessment.assessment_type.toUpperCase()} 
                                  size="small" 
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>{assessment.industry_profile}</TableCell>
                              <TableCell>
                                <Chip
                                  label={assessment.status.replace('_', ' ').toUpperCase()}
                                  color={assessment.status === 'completed' ? 'success' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {assessment.compliance_score ? `${assessment.compliance_score}%` : 'Pending'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(assessment.created_at).toLocaleDateString()}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No recent assessments available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="AI Systems"
                value={dashboardData?.total_assessments || 0}
                icon={<AssessmentIcon />}
                color="primary"
                trend="up"
                trendValue="+2 this quarter"
                subtitle="Under management"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Compliance Rate"
                value={`${Math.round((dashboardData?.completed_assessments / Math.max(dashboardData?.total_assessments, 1)) * 100) || 0}%`}
                icon={<CheckCircleIcon />}
                color="success"
                trend="up"
                trendValue="+8.5%"
                subtitle="Assessment completion"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Risk Score"
                value={dashboardData?.recent_violations || 0}
                icon={<SecurityIcon />}
                color="warning"
                trend="down"
                trendValue="-15%"
                subtitle="Last 30 days"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="ROI Impact"
                value="$2.4M"
                icon={<TrendingUpIcon />}
                color="success"
                trend="up"
                trendValue="+22%"
                subtitle="Risk mitigation value"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <ComplianceScoreCard
                score={dashboardData?.average_compliance_score || 0}
                status={dashboardData?.compliance_status || 'unknown'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <ExecutiveMetricCard
                title="AI Performance"
                metrics={metrics.performanceMetrics}
                icon={<SpeedIcon />}
                color="info"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <ExecutiveMetricCard
                title="Compliance Breakdown"
                metrics={metrics.complianceMetrics}
                icon={<ShieldIcon />}
                color="success"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RiskAssessmentCard risks={metrics.riskAssessment} />
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Strategic Insights & Recommendations
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckCircleIcon sx={{ mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            Strengths
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          • Excellent PII protection compliance (98%)<br/>
                          • Strong audit trail implementation<br/>
                          • Proactive risk monitoring
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <WarningIcon sx={{ mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            Areas for Improvement
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          • Enhance bias detection algorithms<br/>
                          • Increase assessment frequency<br/>
                          • Expand guardrail coverage
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <TimelineIcon sx={{ mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            Next Actions
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          • Schedule Q2 compliance review<br/>
                          • Implement new EU AI Act requirements<br/>
                          • Expand to healthcare vertical
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );

  return (
    <Box className="main-content">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Dashboard
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(event, newMode) => {
            if (newMode !== null) {
              setViewMode(newMode);
            }
          }}
          aria-label="dashboard view mode"
          size="small"
        >
          <ToggleButton value="standard" aria-label="standard dashboard">
            <DashboardIcon sx={{ mr: 0.5, fontSize: 20 }} />
            Standard
          </ToggleButton>
          <ToggleButton value="executive" aria-label="executive dashboard">
            <ExecutiveIcon sx={{ mr: 0.5, fontSize: 20 }} />
            Executive
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {viewMode === 'standard' ? renderStandardDashboard() : renderExecutiveDashboard()}
    </Box>
  );
}