import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, memberAc, ownerAc } from 'better-auth/plugins/organization/access';

const statement = {
  ...defaultStatements,
  orders: ['create', 'update', 'delete'],
  quotations: ['create', 'update', 'delete'],
  products: ['create', 'update', 'delete']
} as const;

export const ac = createAccessControl(statement);

export const owner = ac.newRole({
  orders: ['create', 'update', 'delete'],
  quotations: ['create', 'update', 'delete'],
  products: ['create', 'update', 'delete'],
  ...ownerAc.statements // full control of the organization
});

export const manager = ac.newRole({
  orders: ['create', 'update', 'delete'],
  quotations: ['create', 'update', 'delete'],
  ...memberAc.statements // full control over the organization except for deleting the organization or changing the owner.
});

export const staff = ac.newRole({
  products: ['create'],
  orders: ['create', 'update', 'delete'],
  quotations: ['create', 'update', 'delete']
});
