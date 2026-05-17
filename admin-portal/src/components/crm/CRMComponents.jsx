import React from 'react';
import { Target, Phone, Star, Beaker, ClipboardEdit, Hourglass, XCircle, Trophy, Mail, Users, MonitorPlay, MessageCircle, FileText, CheckCircle, Zap } from 'lucide-react';

export const ScoreBadge = ({ score }) => {
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#6b7280';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 8px', borderRadius: '10px', fontSize: '0.6rem', fontWeight: '800', background: `${color}15`, color, border: `1px solid ${color}30` }}>
      <Zap size={10} /> {score}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const map = { hot: ['#ef4444', 'HOT'], high: ['#f59e0b', 'HIGH'], medium: ['#3b82f6', 'MED'], low: ['#6b7280', 'LOW'] };
  const [color, label] = map[priority] || map.medium;
  return <span style={{ fontSize: '0.55rem', color, fontWeight: '800', padding: '2px 6px', background: `${color}15`, borderRadius: '6px', border: `1px solid ${color}30` }}>{label}</span>;
};

export const stageColors = {
  new: '#6b7280', contacted: '#3b82f6', interested: '#f59e0b',
  trial: '#8b5cf6', enrolled: '#06b6d4', fees_pending: '#f97316', payment_rejected: '#ef4444',
  successful: '#10b981', lost: '#ef4444',
  qualification: '#3b82f6', proposal: '#f59e0b', demo: '#8b5cf6',
  negotiation: '#f97316', won: '#10b981',
};

export const stageLabels = {
  new: 'New Lead', contacted: 'Contacted', interested: 'Interested',
  trial: 'Trial Class', enrolled: 'Enrolled', fees_pending: 'Fees Pending', payment_rejected: 'Payment Rejected',
  successful: 'Successful', lost: 'Lost',
};

export const stageIcons = {
  new: <Target size={14} />, contacted: <Phone size={14} />, interested: <Star size={14} />, trial: <Beaker size={14} />,
  enrolled: <ClipboardEdit size={14} />, fees_pending: <Hourglass size={14} />, payment_rejected: <XCircle size={14} />, successful: <Trophy size={14} />, lost: <XCircle size={14} />,
};

export const actIcons = { call: <Phone size={14} />, email: <Mail size={14} />, meeting: <Users size={14} />, demo: <MonitorPlay size={14} />, whatsapp: <MessageCircle size={14} />, note: <FileText size={14} />, task: <CheckCircle size={14} /> };

export const inputStyle = { padding: '0.65rem 0.8rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' };
