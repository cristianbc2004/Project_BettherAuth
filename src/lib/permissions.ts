import { createAccessControl } from "better-auth/plugins/access";

export const statement = {
  project: ["create", "share", "update", "delete"],
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "impersonate-admins",
    "delete",
    "set-password",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const userRole = ac.newRole({
  project: ["create"],
  user: [],
  session: [],
});

export const adminRole = ac.newRole({
  project: ["create", "share", "update", "delete"],
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "delete",
    "set-password",
    "get",
    "update",
  ],
  session: ["list", "revoke", "delete"],
});
