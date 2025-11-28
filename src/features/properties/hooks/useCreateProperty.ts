// useCreateProperty Hook - Create new property listing
// Uses TanStack Query mutation

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyKeys } from '../api/propertyKeys';
import * as api from '../../../services/apiService';
import { Property } from '../../../types';

/**
 * Hook to create a new property listing
 *
 * Features:
 * - Automatic cache invalidation
 * - Optimistic updates support
 * - Success/error callbacks
 *
 * Usage:
 * ```tsx
 * const { createProperty, isLoading, error } = useCreateProperty();
 *
 * const handleCreate = async (propertyData) => {
 *   try {
 *     const newProperty = await createProperty(propertyData);
 *     console.log('Created:', newProperty);
 *   } catch (err) {
 *     console.error('Failed:', err);
 *   }
 * };
 * ```
 */
export function useCreateProperty() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (propertyData: Property): Promise<Property> => {
      return await api.createListing(propertyData);
    },
    onSuccess: (newProperty) => {
      // Invalidate and refetch property lists
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyKeys.myListings() });

      // Add to cache immediately for instant access
      queryClient.setQueryData(propertyKeys.detail(newProperty.id), newProperty);
    },
    onError: (error: any) => {
      console.error('Create property error:', error);
    },
  });

  return {
    createProperty: mutation.mutateAsync,
    createPropertySync: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}
