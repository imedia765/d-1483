import { GitBranch, GitCommit, GitMerge, GitPullRequest, Settings, Code2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Repositories",
    url: "/",
    icon: GitBranch,
  },
  {
    title: "Push Operations",
    url: "/push",
    icon: GitCommit,
  },
  {
    title: "Pull Requests",
    url: "/pull-requests",
    icon: GitPullRequest,
  },
  {
    title: "Merge",
    url: "/merge",
    icon: GitMerge,
  },
  {
    title: "Web Dev Tools",
    url: "/web-tools",
    icon: Code2,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Git Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}