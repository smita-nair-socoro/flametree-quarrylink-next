'use client';

import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { ExternalLink, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import React from 'react';

export default function BillingTab() {
  const usage = {
    totalUsers: 20,
    currentUsers: 3,
    userPercentage: 15,
    totalDrivers: 20,
    currentDrivers: 8,
    driverPercentage: 40,
    totalTrucks: 25,
    currentTrucks: 12,
    truckPercentage: 48,
    totalQuarries: 25,
    currentQuarries: 12,
    quarryPercentage: 48,
  };
  const recentInvoices = [
    {
      date: 'March 2024',
      amount: '$149.00',
      status: 'Paid',
    },
    {
      date: 'February 2024',
      amount: '$229.00',
      status: 'Paid',
    },
    {
      date: 'January 2024',
      amount: '$129.00',
      status: 'Paid',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">Subscription & Billing</h2>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-[24px] font-medium">
              Current Plan
            </CardTitle>
            <Button variant="outline" className="cursor-pointer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Manage Billing
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-0.5">
                <span className="text-[18px] font-medium">
                  Professional Plan
                </span>
                <span className="text-[16px] text-[#4B5563]">
                  $149/month Billed monthly
                </span>
              </div>
              <Badge className="text-[#166534] bg-[#DCFCE7] border-[#DCFCE7] px-2 py-0.5 text-xs font-medium border">
                Active
              </Badge>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[16px] text-[#4B5563]">
                Next billing: 15 April 2025
              </span>
              <span className="text-[16px] text-[#4B5563]">
                Payment: **** 4242 (Visa)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-[24px] font-medium">
          Usage & Limits
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Users */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Users:</span>
                <span className="text-sm font-medium">
                  {usage.currentUsers}/{usage.totalUsers}
                </span>
              </div>
              <Progress value={usage.userPercentage} className="h-2" />
              <span className="text-xs text-[#6B7280]">
                {usage.userPercentage}% used
              </span>
            </div>

            {/* Drivers */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Drivers:</span>
                <span className="text-sm font-medium">
                  {usage.currentDrivers}/{usage.totalDrivers}
                </span>
              </div>
              <Progress value={usage.driverPercentage} className="h-2" />
              <span className="text-xs text-[#6B7280]">
                {usage.driverPercentage}% used
              </span>
            </div>

            {/* Trucks */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Trucks:</span>
                <span className="text-sm font-medium">
                  {usage.currentTrucks}/{usage.totalTrucks}
                </span>
              </div>
              <Progress value={usage.truckPercentage} className="h-2" />
              <span className="text-xs text-[#6B7280]">
                {usage.truckPercentage}% used
              </span>
            </div>

            {/* Quarries */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Quarries:</span>
                <span className="text-sm font-medium">
                  {usage.currentQuarries}/{usage.totalQuarries}
                </span>
              </div>
              <Progress value={usage.quarryPercentage} className="h-2" />
              <span className="text-xs text-[#6B7280]">
                {usage.quarryPercentage}% used
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-[24px] font-medium">
              Recent Invoices
            </CardTitle>
            <Button variant="ghost" className="text-sm">
              View All Invoices
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {recentInvoices.map((invoice, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{invoice.date}</span>
                  <span className="text-sm text-[#4B5563]">
                    {invoice.amount}
                  </span>
                  <Badge className="text-[#166534] bg-[#DCFCE7] border-[#DCFCE7] px-2 py-0.5 text-xs font-medium border">
                    {invoice.status}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
