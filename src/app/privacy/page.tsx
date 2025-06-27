"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Shield, Lock, Eye, Database, Mail, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Privacy Policy</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <CardTitle>Your Privacy Matters</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              At IdeaVault, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Last Updated:</strong> December 2024<br />
                <strong>Effective Date:</strong> December 2024
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-500" />
              <CardTitle>Information We Collect</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Personal Information</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Email address (for account creation and communication)</li>
                <li>Name (optional, for collaboration features)</li>
                <li>Profile information you choose to provide</li>
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">Product Data</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Ideas and product descriptions you create</li>
                <li>Generated PRDs and AI-enhanced content</li>
                <li>Collaboration data and shared documents</li>
                <li>Usage analytics and interaction patterns</li>
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">Technical Data</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Session data and authentication tokens</li>
                <li>Performance and error logs</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <CardTitle>How We Use Your Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Service Provision</h3>
                <p className="text-sm text-muted-foreground">
                  To provide core functionality including idea management, PRD generation, and collaboration features.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">AI Enhancement</h3>
                <p className="text-sm text-muted-foreground">
                  To improve AI-powered features and provide personalized content recommendations.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Communication</h3>
                <p className="text-sm text-muted-foreground">
                  To send important updates, collaboration notifications, and support messages.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Platform Improvement</h3>
                <p className="text-sm text-muted-foreground">
                  To analyze usage patterns and improve our services (anonymized data only).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-500" />
              <CardTitle>Data Security & Protection</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
              <h3 className="font-semibold text-green-400 mb-2">Enterprise-Grade Security</h3>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>End-to-end encryption for all data transmission</li>
                <li>Secure database with row-level security (RLS)</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>SOC 2 compliant infrastructure via Supabase</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Access Controls</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Multi-factor authentication support</li>
                <li>Granular permission management for collaborations</li>
                <li>Regular access reviews and automated session management</li>
                <li>Zero-trust security model</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-orange-500" />
              <CardTitle>Data Sharing & Third Parties</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-400 mb-2">We Never Sell Your Data</h3>
              <p className="text-sm">
                Your personal information and ideas are never sold to third parties or used for advertising purposes.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Limited Third-Party Services</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li><strong>Supabase:</strong> Database and authentication infrastructure</li>
                <li><strong>Google Gemini:</strong> AI-powered content generation (no data retention)</li>
                <li><strong>Vercel:</strong> Hosting and deployment platform</li>
                <li><strong>Email Services:</strong> Transactional emails and notifications</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle>Your Rights & Choices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Data Access & Export</h3>
                <p className="text-sm text-muted-foreground">
                  Request a copy of all your data or export your ideas and PRDs at any time.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Data Correction</h3>
                <p className="text-sm text-muted-foreground">
                  Update or correct any personal information through your account settings.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Data Deletion</h3>
                <p className="text-sm text-muted-foreground">
                  Delete your account and all associated data permanently at any time.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Communication Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Control what notifications and communications you receive from us.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookies & Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Cookies & Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We use minimal cookies and tracking to provide essential functionality:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li><strong>Essential Cookies:</strong> Authentication and session management</li>
              <li><strong>Preference Cookies:</strong> Theme settings and user preferences</li>
              <li><strong>Analytics:</strong> Anonymous usage patterns to improve our service</li>
            </ul>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm">
                You can disable non-essential cookies through your browser settings without affecting core functionality.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Sending an email notification to your registered email address</li>
              <li>Posting a notice on our platform</li>
              <li>Updating the "Last Updated" date at the top of this policy</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <strong>Email:</strong> assembleworkss@gmail.com<br />
                <strong>Response Time:</strong> Within 48 hours<br />
                <strong>Data Protection Officer:</strong> Available upon request
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 