import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { RepoManager } from "@/components/RepoManager";

const Repositories = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Git Repository Manager</h1>
              <SidebarTrigger className="md:hidden" />
            </div>
            <RepoManager />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Repositories;