/**
 * Dashboard Component for AI Compliance Platform
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
  LinearProgress
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../contexts/ApiContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const mockTrendsData = [
  { name: 'Mon', score: 85, violations: 4 },
  { name: 'Tue', score: 88, violations: 3 },
  { name: 'Wed', score: 86, violations: 5 },
  { name: 'Thu', score: 92, violations: 1 },
  { name: 'Fri', score: 95, violations: 0 },
  { name: 'Sat', score: 94, violations: 2 },
  { name: 'Sun', score: 96, violations: 1 },
];

function StatCard({ title, value, icon, color = 'primary', subtitle }) {
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

export default function Dashboard() {
  const { user } = useAuth();
  const { getDashboardData } = useApi();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

    loadDashboardData();
  }, [getDashboardData]);

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

  return (
    <Box className="main-content">
      <Typography variant="h4" gutterBottom>
        {isRegulatory ? 'Regulatory Dashboard' : 'Compliance Dashboard'}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" gutterBottom>
        {isRegulatory 
          ? 'Monitor compliance across all organizations under your jurisdiction'
          : 'Monitor your organization\'s AI compliance status and performance'
        }
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {isRegulatory ? (
          // Regulatory Inspector Dashboard
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Organizations"
                value={dashboardData?.total_organizations || 0}
                icon={<BusinessIcon />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Assessments"
                value={dashboardData?.total_assessments || 0}
                icon={<AssessmentIcon />}
                color="secondary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Completed Assessments"
                value={dashboardData?.completed_assessments || 0}
                icon={<AssessmentIcon />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
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
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Compliance Trends (Platform-Wide)
                  </Typography>
                  <Box sx={{ width: '100%', height: 300, mt: 3 }}>
                    <ResponsiveContainer>
                      <BarChart data={mockTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#1976d2" />
                        <YAxis yAxisId="right" orientation="right" stroke="#dc004e" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="score" name="Avg Score" fill="#1976d2" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="violations" name="Violations" fill="#dc004e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          // Organization Admin Dashboard
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Assessments"
                value={dashboardData?.total_assessments || 0}
                icon={<AssessmentIcon />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Completed Assessments"
                value={dashboardData?.completed_assessments || 0}
                icon={<AssessmentIcon />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ComplianceScoreCard
                score={dashboardData?.average_compliance_score || 0}
                status={dashboardData?.compliance_status || 'unknown'}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
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
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Weekly Compliance Trends
                  </Typography>
                  <Box sx={{ width: '100%', height: 300, mt: 3 }}>
                    <ResponsiveContainer>
                      <BarChart data={mockTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#1976d2" />
                        <YAxis yAxisId="right" orientation="right" stroke="#dc004e" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="score" name="Compliance Score" fill="#1976d2" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="violations" name="Violations" fill="#dc004e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
}