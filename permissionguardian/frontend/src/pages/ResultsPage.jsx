import React from 'react';
import ResultsDashboard from './ResultsDashboard';

export default function ResultsPage({ data, onReset }) {
  return <ResultsDashboard data={data} onReset={onReset} />;
}
