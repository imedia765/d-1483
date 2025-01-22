import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const CollectorRolesHeader = () => {
  return (
    <TableHeader>
      <TableRow className="border-dashboard-cardBorder hover:bg-dashboard-card/50">
        <TableHead className="text-dashboard-accent1">Collector</TableHead>
        <TableHead className="text-dashboard-accent1">Member #</TableHead>
        <TableHead className="text-dashboard-accent1">Contact Info</TableHead>
        <TableHead className="text-dashboard-accent1">Roles & Access</TableHead>
        <TableHead className="text-dashboard-accent1">Role History</TableHead>
        <TableHead className="text-dashboard-accent1">Enhanced Role Status</TableHead>
        <TableHead className="text-dashboard-accent1">Role Store Status</TableHead>
        <TableHead className="text-dashboard-accent1">Sync Status</TableHead>
        <TableHead className="text-dashboard-accent1">Permissions</TableHead>
      </TableRow>
    </TableHeader>
  );
};