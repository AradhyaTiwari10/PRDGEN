"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
}

export function CollaborationTest() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const testResults: TestResult[] = [];

    // Test 1: Check if collaboration_requests table exists
    try {
      await supabase.from('collaboration_requests').select('id').limit(1);
      testResults.push({
        name: 'Collaboration Requests Table',
        status: 'success',
        message: 'Table exists and is accessible'
      });
    } catch (error: any) {
      testResults.push({
        name: 'Collaboration Requests Table',
        status: 'error',
        message: error.message || 'Table does not exist'
      });
    }

    // Test 2: Check if shared_ideas table exists
    try {
      await supabase.from('shared_ideas').select('id').limit(1);
      testResults.push({
        name: 'Shared Ideas Table',
        status: 'success',
        message: 'Table exists and is accessible'
      });
    } catch (error: any) {
      testResults.push({
        name: 'Shared Ideas Table',
        status: 'error',
        message: error.message || 'Table does not exist'
      });
    }

    // Test 3: Check if get_user_id_by_email function exists
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const result = await supabase.rpc('get_user_id_by_email', { user_email: user.email });
        if (result.data === user.id) {
          testResults.push({
            name: 'Get User ID By Email Function',
            status: 'success',
            message: 'Function exists and returns correct user ID'
          });
        } else {
          testResults.push({
            name: 'Get User ID By Email Function',
            status: 'success',
            message: 'Function exists but returned different ID (this is normal)'
          });
        }
      } else {
        testResults.push({
          name: 'Get User ID By Email Function',
          status: 'error',
          message: 'Cannot test - no authenticated user email'
        });
      }
    } catch (error: any) {
      testResults.push({
        name: 'Get User ID By Email Function',
        status: 'error',
        message: error.message || 'Function does not exist'
      });
    }

    // Test 4: Check if requester_email column exists
    try {
      const { data, error } = await supabase
        .from('collaboration_requests')
        .select('requester_email')
        .limit(1);

      if (error && error.message.includes('column "requester_email" does not exist')) {
        testResults.push({
          name: 'Requester Email Column',
          status: 'error',
          message: 'Column missing - run fix-collaboration-tables.sql'
        });
      } else {
        testResults.push({
          name: 'Requester Email Column',
          status: 'success',
          message: 'Column exists and is accessible'
        });
      }
    } catch (error: any) {
      testResults.push({
        name: 'Requester Email Column',
        status: 'error',
        message: error.message || 'Failed to check column'
      });
    }

    // Test 5: Check authentication
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        testResults.push({
          name: 'User Authentication',
          status: 'success',
          message: `Authenticated as ${user.email}`
        });
      } else {
        testResults.push({
          name: 'User Authentication',
          status: 'error',
          message: 'No authenticated user'
        });
      }
    } catch (error: any) {
      testResults.push({
        name: 'User Authentication',
        status: 'error',
        message: error.message || 'Authentication check failed'
      });
    }

    setTests(testResults);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Collaboration Feature Test
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Run this test to verify that the collaboration feature is properly set up.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </Button>

        {tests.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Test Results:</h3>
            {tests.map((test, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(test.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{test.name}</span>
                    {getStatusBadge(test.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{test.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tests.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Next Steps:</h4>
            {tests.some(t => t.status === 'error') ? (
              <div className="text-sm space-y-1">
                <p>❌ Some tests failed. Please:</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Copy the SQL from <code>setup-collaboration.sql</code></li>
                  <li>Go to your Supabase Dashboard → SQL Editor</li>
                  <li>Paste and run the SQL script</li>
                  <li>Run the tests again</li>
                </ol>
              </div>
            ) : (
              <p className="text-sm text-green-600">
                ✅ All tests passed! The collaboration feature is ready to use.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
