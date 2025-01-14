import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';

const UserManual = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const { data: currentManual, isLoading } = useQuery({
    queryKey: ['current-manual'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documentation')
        .select('*')
        .eq('is_current', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-manual');
      
      if (error) throw error;

      window.open(data.url, '_blank');

      toast({
        title: "Success",
        description: "User manual generated successfully",
      });
    } catch (error) {
      console.error('Error downloading manual:', error);
      toast({
        title: "Error",
        description: "Failed to generate user manual",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-dashboard-accent1" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">User Manual</h2>
          {currentManual ? (
            <p className="text-sm text-dashboard-muted">
              Version {currentManual.version} • Last updated: {new Date(currentManual.updated_at).toLocaleDateString()}
            </p>
          ) : (
            <p className="text-sm text-dashboard-muted">No manual version available</p>
          )}
        </div>
        <Button
          onClick={handleDownload}
          disabled={isGenerating}
          className="bg-dashboard-accent1 hover:bg-dashboard-accent1/80"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4 mr-2" />
              {currentManual ? 'Download Manual' : 'Generate Manual'}
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-dashboard-card border border-dashboard-cardBorder rounded-lg p-6">
          <img 
            src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b" 
            alt="Getting Started" 
            className="w-full h-48 object-cover rounded-md mb-4"
          />
          <h3 className="text-lg font-medium text-white mb-4">Getting Started</h3>
          <div className="space-y-2 text-dashboard-text">
            <p>• Login Process - Simple member number authentication</p>
            <p>• Dashboard Overview - Navigate your personalized dashboard</p>
            <p>• Profile Setup - Complete your member information</p>
          </div>
        </div>

        <div className="bg-dashboard-card border border-dashboard-cardBorder rounded-lg p-6">
          <img 
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" 
            alt="Member Features" 
            className="w-full h-48 object-cover rounded-md mb-4"
          />
          <h3 className="text-lg font-medium text-white mb-4">Member Features</h3>
          <div className="space-y-2 text-dashboard-text">
            <p>• Profile Management - Update your personal information</p>
            <p>• Payment History - Track all your contributions</p>
            <p>• Family Members - Manage your family information</p>
          </div>
        </div>

        <div className="bg-dashboard-card border border-dashboard-cardBorder rounded-lg p-6">
          <img 
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158" 
            alt="Collector Features" 
            className="w-full h-48 object-cover rounded-md mb-4"
          />
          <h3 className="text-lg font-medium text-white mb-4">Collector Features</h3>
          <div className="space-y-2 text-dashboard-text">
            <p>• Member Management - View and manage assigned members</p>
            <p>• Collection Tracking - Record and monitor payments</p>
            <p>• Reports Generation - Create detailed collection reports</p>
          </div>
        </div>

        <div className="bg-dashboard-card border border-dashboard-cardBorder rounded-lg p-6">
          <img 
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085" 
            alt="Admin Features" 
            className="w-full h-48 object-cover rounded-md mb-4"
          />
          <h3 className="text-lg font-medium text-white mb-4">Admin Features</h3>
          <div className="space-y-2 text-dashboard-text">
            <p>• System Management - Configure system settings</p>
            <p>• User Administration - Manage roles and permissions</p>
            <p>• Monitoring Tools - Track system performance</p>
          </div>
        </div>
      </div>

      <div className="bg-dashboard-card border border-dashboard-cardBorder rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Additional Resources</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="bg-dashboard-accent1/10 p-3 rounded-lg">
              <FileDown className="w-5 h-5 text-dashboard-accent1" />
            </div>
            <div>
              <h4 className="text-white font-medium">Troubleshooting Guide</h4>
              <p className="text-dashboard-text text-sm">Common issues and their solutions</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-dashboard-accent1/10 p-3 rounded-lg">
              <FileDown className="w-5 h-5 text-dashboard-accent1" />
            </div>
            <div>
              <h4 className="text-white font-medium">Quick Start Guide</h4>
              <p className="text-dashboard-text text-sm">Step-by-step guide for new users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManual;