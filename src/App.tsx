import React, { useEffect, useRef } from 'react';
import useWebSocket from './hooks/useWebSocket';
import Header from './components/Header';
import PowerSection from './components/sections/PowerSection';
import ProcessSection from './components/sections/ProcessSection';
import ProcessCardsSection from './components/sections/ProcessCardsSection';
import ComparisonSection from './components/sections/ComparisonSection';
import ConnectionStatus from './components/ConnectionStatus';
import MetricCard from './components/cards/MetricCard';
import { Zap, BarChart3, TrendingUp } from 'lucide-react';

function App() {
  const websocketUrl = "ws://192.168.10.123:5000/ws";
  const { dashboardData, isConnected, reconnect } = useWebSocket(websocketUrl);
  const wsRef = useRef<WebSocket | null>(null);

  // For demonstration, we'll use the reconnect function from the hook
  const handleRetryConnection = () => {
    reconnect();
  };

  // Add a class to the body for animation tracking
  useEffect(() => {
    document.body.classList.add('dashboard-loaded');
    return () => {
      document.body.classList.remove('dashboard-loaded');
    };
  }, []);

  const getChangePercentage = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isConnected={isConnected} />
      
      <main className="container mx-auto px-4 py-6">
        {/* Top Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          <MetricCard
            title="Current Power"
            value={dashboardData.currentPower?.TotalPower || 0}
            unit="kW"
            subtitle="Real-time Total Power"
            icon={<Zap className="w-6 h-6" />}
          />
          
          <MetricCard
            title="Today's Consumption"
            value={dashboardData.todayData?.TodayConsumption || 0}
            unit="kVAh"
            subtitle="Total Energy Used Today"
            changePercentage={
              dashboardData.todayData?.TodayConsumption && dashboardData.todayData?.TodayProduction
                ? getChangePercentage(
                    dashboardData.todayData.TodayConsumption,
                    dashboardData.todayData.TodayProduction
                  )
                : undefined
            }
          />
          
          <MetricCard
            title="Monthly Consumption"
            value={dashboardData.monthlyData?.ThisMonthConsumption || 0}
            unit="kVAh"
            subtitle="This Month"
            changePercentage={
              dashboardData.monthlyData?.ThisMonthConsumption && dashboardData.monthlyData?.PreviousMonthConsumption
                ? getChangePercentage(
                    dashboardData.monthlyData.ThisMonthConsumption,
                    dashboardData.monthlyData.PreviousMonthConsumption
                  )
                : undefined
            }
            icon={<BarChart3 className="w-6 h-6" />}
          />
          
          <MetricCard
            title="Consumption Per Tonne"
            value={dashboardData.consumptionPerTonne?.ThisMonthConsumptionPerTonne || 0}
            unit="kVAh/t"
            subtitle="Energy Efficiency"
            changePercentage={
              dashboardData.consumptionPerTonne?.ThisMonthConsumptionPerTonne && 
              dashboardData.consumptionPerTonne?.PreviousMonthConsumptionPerTonne
                ? getChangePercentage(
                    dashboardData.consumptionPerTonne.ThisMonthConsumptionPerTonne,
                    dashboardData.consumptionPerTonne.PreviousMonthConsumptionPerTonne
                  )
                : undefined
            }
          />
          
          <MetricCard
            title="Production"
            value={dashboardData.todayData?.TodayProduction || 0}
            unit="kVAh"
            subtitle="Today's Production"
            icon={<TrendingUp className="w-6 h-6" />}
          />
        </div>
        
        {/* Comparison Cards */}
        <div className="mb-6">
          <ComparisonSection
            consumptionPerTonne={dashboardData.consumptionPerTonne}
            monthlyData={dashboardData.monthlyData}
            todayData={dashboardData.todayData}
          />
        </div>
        
        {/* Process Cards */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Process Details</h2>
          <ProcessCardsSection processData={dashboardData.latestEnergyData} />
        </div>
        
        {/* Power Chart & Process Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PowerSection 
            powerData={dashboardData.powerViewData} 
            currentPower={dashboardData.currentPower} 
          />
          <ProcessSection processData={dashboardData.latestEnergyData} />
        </div>
      </main>
      
      <ConnectionStatus 
        isConnected={isConnected} 
        onRetry={handleRetryConnection} 
      />
    </div>
  );
}

export default App;