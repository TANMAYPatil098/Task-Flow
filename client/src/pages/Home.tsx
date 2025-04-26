
import React from 'react';
import Navigation from '@/components/Navigation';
import Board from '@/components/Board';
import { Card } from '@/components/ui/card';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-muted/90">
      <Navigation />
      <main className="flex-1 overflow-hidden flex flex-col p-4">
        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 text-center mb-4">
          <h1 className="text-2xl font-semibold text-primary">Productivity Dashboard</h1>
        </Card>
        <Board />
      </main>
    </div>
  );
};

export default Home;
