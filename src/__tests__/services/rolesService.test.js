import axios from 'axios';
import {
  getRoles, createRole, updateRole, deleteRole,
  getSettingsUsers, inviteUser, updateSettingsUser, deactivateUser,
  getMyPermissions,
} from '../../services/rolesService';

jest.mock('axios');

beforeEach(() => jest.clearAllMocks());

describe('rolesService', () => {
  describe('getRoles', () => {
    it('returns roles list', async () => {
      axios.get.mockResolvedValue({ data: [{ id: 'r1', name: 'Admin' }] });
      const result = await getRoles();
      expect(result).toEqual([{ id: 'r1', name: 'Admin' }]);
    });
  });

  describe('createRole', () => {
    it('creates a role', async () => {
      axios.post.mockResolvedValue({ data: { id: 'r2', name: 'Editor' } });
      const result = await createRole({ name: 'Editor' });
      expect(result).toEqual({ id: 'r2', name: 'Editor' });
    });
  });

  describe('updateRole', () => {
    it('updates a role', async () => {
      axios.put.mockResolvedValue({ data: { id: 'r1', name: 'SuperAdmin' } });
      const result = await updateRole('r1', { name: 'SuperAdmin' });
      expect(result).toEqual({ id: 'r1', name: 'SuperAdmin' });
    });
  });

  describe('deleteRole', () => {
    it('deletes a role', async () => {
      axios.delete.mockResolvedValue({ data: { deleted: true } });
      const result = await deleteRole('r1');
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('getSettingsUsers', () => {
    it('returns users list', async () => {
      axios.get.mockResolvedValue({ data: [{ id: 'u1', username: 'admin' }] });
      const result = await getSettingsUsers();
      expect(result).toEqual([{ id: 'u1', username: 'admin' }]);
    });
  });

  describe('inviteUser', () => {
    it('invites a user', async () => {
      axios.post.mockResolvedValue({ data: { id: 'u2', invited: true } });
      const result = await inviteUser({ username: 'new', role: 'Editor' });
      expect(result).toEqual({ id: 'u2', invited: true });
    });
  });

  describe('updateSettingsUser', () => {
    it('updates a user', async () => {
      axios.put.mockResolvedValue({ data: { id: 'u1', role: 'Admin' } });
      const result = await updateSettingsUser('u1', { role: 'Admin' });
      expect(result).toEqual({ id: 'u1', role: 'Admin' });
    });
  });

  describe('deactivateUser', () => {
    it('deactivates a user', async () => {
      axios.delete.mockResolvedValue({ data: { deactivated: true } });
      const result = await deactivateUser('u1');
      expect(result).toEqual({ deactivated: true });
    });
  });

  describe('getMyPermissions', () => {
    it('returns current user permissions', async () => {
      const perms = { is_admin: true, permissions: {} };
      axios.get.mockResolvedValue({ data: perms });
      const result = await getMyPermissions();
      expect(result).toEqual(perms);
    });
  });
});
