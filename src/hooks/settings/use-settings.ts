import {
  onUpdatePassword,
  onDeleteUser,
} from '@/actions/settings';
import { useToast } from '@/hooks/use-toast';
import {
  ChangePasswordProps,
  ChangePasswordSchema,
} from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export const useChangePassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordProps>({
    resolver: zodResolver(ChangePasswordSchema),
    mode: 'onChange',
  });
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);

  const onChangePassword = handleSubmit(async (values) => {
    try {
      setLoading(true);
      const updated = await onUpdatePassword(values.password);
      if (updated) {
        reset();
        toast({ title: 'Success', description: updated.message });
      } else {
        toast({ title: 'Error', description: 'Failed to update password' });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast({ title: 'Error', description: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  });

  return {
    register,
    errors,
    onChangePassword,
    loading,
  };
};

export const useDeleteUser = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);

  const onDelete = async () => {
    try {
      setLoading(true);
      const deleted = await onDeleteUser();
      if (deleted) {
        toast({ title: 'Success', description: deleted.message });
        redirect('/');
      } else {
        toast({ title: 'Error', description: 'Failed to delete account' });
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({ title: 'Error', description: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return {
    onDelete,
    loading,
  };
};

