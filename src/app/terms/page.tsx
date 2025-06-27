"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Scale, AlertTriangle, Globe, CreditCard, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsOfServicePage() {
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
              <Scale className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Terms of Service</h1>
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
              <FileText className="h-5 w-5 text-blue-500" />
              <CardTitle>Welcome to IdeaVault</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              These Terms of Service ("Terms") govern your use of IdeaVault, a platform that helps you transform 
              product ideas into comprehensive PRDs using AI technology. By accessing or using our service, 
              you agree to be bound by these Terms.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Last Updated:</strong> December 2024<br />
                <strong>Effective Date:</strong> December 2024<br />
                <strong>Company:</strong> IdeaVault Technologies
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance of Terms */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              <CardTitle>Acceptance of Terms</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              By creating an account, accessing, or using IdeaVault, you confirm that:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>You are at least 18 years old or have parental consent</li>
              <li>You have the legal capacity to enter into these Terms</li>
              <li>You will comply with all applicable laws and regulations</li>
              <li>You understand and accept our Privacy Policy</li>
            </ul>
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
              <p className="text-sm text-amber-400">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                If you do not agree to these Terms, please do not use our service.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-500" />
              <CardTitle>Service Description</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">What IdeaVault Offers</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>AI-powered idea enhancement and structuring</li>
                <li>Comprehensive PRD generation for AI coding tools</li>
                <li>Real-time collaboration features</li>
                <li>Export capabilities (Markdown, PDF, plain text)</li>
                <li>Similarity search and idea discovery</li>
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">Service Availability</h3>
              <p className="text-muted-foreground text-sm">
                We strive to provide 99.9% uptime but cannot guarantee uninterrupted service. 
                Maintenance windows and updates may temporarily affect availability.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>User Accounts & Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Account Security</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>You are responsible for maintaining account security</li>
                <li>Use strong passwords and enable MFA when available</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Do not share your account credentials</li>
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">Acceptable Use</h3>
              <div className="grid gap-4">
                <div className="p-4 border border-green-500/20 bg-green-500/10 rounded-lg">
                  <h4 className="font-medium text-green-400 mb-2">✅ Allowed Uses</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                    <li>Creating and developing legitimate business ideas</li>
                    <li>Collaborating with team members on projects</li>
                    <li>Generating PRDs for personal or commercial use</li>
                    <li>Educational and learning purposes</li>
                  </ul>
                </div>
                
                <div className="p-4 border border-red-500/20 bg-red-500/10 rounded-lg">
                  <h4 className="font-medium text-red-400 mb-2">❌ Prohibited Uses</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                    <li>Illegal activities or violation of laws</li>
                    <li>Harassment, abuse, or harmful content</li>
                    <li>Spam, phishing, or malicious activities</li>
                    <li>Reverse engineering or system exploitation</li>
                    <li>Sharing of copyrighted material without permission</li>
                    <li>Creating fake or misleading accounts</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle>Intellectual Property Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Your Content</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>You retain full ownership of your ideas and content</li>
                <li>You grant us a license to process and store your content</li>
                <li>We do not claim ownership of your intellectual property</li>
                <li>You can export and delete your content at any time</li>
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">Our Platform</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>IdeaVault platform and technology are our property</li>
                <li>Our trademarks, logos, and branding are protected</li>
                <li>You may not copy, modify, or redistribute our platform</li>
                <li>Open source components retain their original licenses</li>
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">AI-Generated Content</h3>
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                <p className="text-sm text-blue-400">
                  AI-enhanced content becomes your property, but you acknowledge that similar 
                  outputs may be generated for other users using the same AI models.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-500" />
              <CardTitle>Payment & Billing</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Free Tier</h3>
              <p className="text-muted-foreground text-sm">
                IdeaVault offers a generous free tier with access to core features. 
                Free usage is subject to fair use policies and rate limits.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">Future Premium Features</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Advanced AI models and enhanced processing</li>
                <li>Priority support and faster response times</li>
                <li>Extended collaboration features</li>
                <li>Higher usage limits and storage quotas</li>
              </ul>
              <div className="bg-muted/50 p-4 rounded-lg mt-4">
                <p className="text-sm">
                  We will provide 30 days notice before introducing any paid features 
                  and existing functionality will remain free.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Data */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy & Data Protection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your privacy is important to us. Our data practices are governed by our 
              <Link to="/privacy" className="text-primary hover:underline mx-1">Privacy Policy</Link>
              which forms part of these Terms.
            </p>
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Data Security</h3>
                <p className="text-sm text-muted-foreground">
                  Enterprise-grade security with encryption, access controls, and regular audits.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Data Portability</h3>
                <p className="text-sm text-muted-foreground">
                  Export your data anytime in standard formats (JSON, Markdown, PDF).
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Data Deletion</h3>
                <p className="text-sm text-muted-foreground">
                  Delete your account and all data permanently with a single click.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle>Disclaimers & Limitations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Service Disclaimer</h3>
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
                <p className="text-sm text-amber-400">
                  IdeaVault is provided "as is" without warranties. We do not guarantee 
                  the accuracy, completeness, or suitability of AI-generated content for any purpose.
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">AI Content Limitations</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>AI outputs may contain errors or biases</li>
                <li>Verify all information before implementation</li>
                <li>We are not responsible for business decisions based on AI outputs</li>
                <li>AI-generated content is not professional advice</li>
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">Limitation of Liability</h3>
              <p className="text-muted-foreground text-sm">
                Our liability is limited to the maximum extent permitted by law. 
                We are not liable for indirect, consequential, or business loss damages.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card>
          <CardHeader>
            <CardTitle>Account Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Your Right to Terminate</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Delete your account anytime through settings</li>
                <li>Export your data before deletion</li>
                <li>No penalties for account termination</li>
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">Our Right to Terminate</h3>
              <p className="text-muted-foreground text-sm mb-2">
                We may suspend or terminate accounts that violate these Terms, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Violation of acceptable use policies</li>
                <li>Fraudulent or illegal activities</li>
                <li>Abuse of our systems or other users</li>
                <li>Non-payment of fees (if applicable)</li>
              </ul>
              <div className="bg-muted/50 p-4 rounded-lg mt-4">
                <p className="text-sm">
                  We will provide reasonable notice before termination unless 
                  immediate action is required for security or legal reasons.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Changes to These Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We may update these Terms to reflect changes in our service, legal requirements, 
              or business practices. We will notify you of material changes through:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Email notification to your registered address</li>
              <li>In-app notifications and announcements</li>
              <li>Updated terms with change highlights</li>
              <li>30-day notice period for significant changes</li>
            </ul>
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
              <p className="text-sm text-blue-400">
                Continued use of IdeaVault after changes constitutes acceptance of new Terms.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card>
          <CardHeader>
            <CardTitle>Governing Law & Disputes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Applicable Law</h3>
              <p className="text-muted-foreground text-sm">
                These Terms are governed by the laws of [Your Jurisdiction] without 
                regard to conflict of law principles.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">Dispute Resolution</h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-4">
                <li>Contact us first to resolve disputes informally</li>
                <li>Mediation through agreed neutral third party</li>
                <li>Binding arbitration as final resort</li>
                <li>Class action waiver applies</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Questions about these Terms? Contact us:
            </p>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <strong>Email:</strong> assembleworkss@gmail.com<br />
                <strong>Support:</strong> assembleworkss@gmail.com<br />

                <strong>Response Time:</strong> Within 48 hours
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <Button asChild variant="outline">
                <Link to="/privacy">Privacy Policy</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/">Back to IdeaVault</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 