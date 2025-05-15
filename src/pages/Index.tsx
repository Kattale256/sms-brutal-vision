
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';

const Index = () => {
  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Financial Data Analyzer</h1>
        <p className="text-muted-foreground mt-2">Analyze your transactions and manage tax forms</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Statistics</CardTitle>
            <CardDescription>
              View and analyze your financial transaction data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Gain insights into your spending patterns, income sources, and financial habits with our comprehensive transaction analytics.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/transactions">View Transactions</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tax Form Builder
            </CardTitle>
            <CardDescription>
              Import, fill and export tax Excel forms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Upload your tax Excel forms, fill them out with our user-friendly interface, and export them in the required format.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="default">
              <Link to="/tax-form">Open Tax Form Builder</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Message Analysis</CardTitle>
            <CardDescription>
              Analyze financial messages and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Process and categorize financial messages and notifications to extract valuable data points from your communications.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link to="/messages">View Messages</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
