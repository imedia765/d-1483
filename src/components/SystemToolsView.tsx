import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SystemHealthCheck from "./system/SystemHealthCheck";
import GitOperationsCard from "./system/GitOperationsCard";
import RoleManagementCard from "./system/RoleManagementCard";
import UserManual from "./documentation/UserManual";
import AnnouncementsManager from "./system/AnnouncementsManager";

const SystemToolsView = () => {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-medium mb-2 text-white">System Tools</h1>
        <p className="text-dashboard-muted">Manage system settings and monitor performance</p>
      </header>

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="git">Git Operations</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="manual">User Manual</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <SystemHealthCheck />
        </TabsContent>

        <TabsContent value="git" className="space-y-4">
          <GitOperationsCard />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <RoleManagementCard />
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <UserManual />
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <AnnouncementsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemToolsView;