import { MemberTables } from './member-tables';
import { AuditTables } from './audit-tables';
import { GitTables } from './git-tables';
import { RoleTables } from './role-tables';
import { SystemTables } from './system-tables';

export type DatabaseTables = MemberTables & AuditTables & GitTables & RoleTables & SystemTables;

export * from './member-tables';
export * from './audit-tables';
export * from './git-tables';
export * from './role-tables';
export * from './system-tables';