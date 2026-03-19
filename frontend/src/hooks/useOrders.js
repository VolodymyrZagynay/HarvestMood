import { useQuery, useMutation, useQueryClient } from 'react-query';
import { orderService } from '../services/orders';

export const useOrders = () => {
  const { data: orders, isLoading, error, refetch } = useQuery(
    'orders',
    orderService.getOrders,
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const getOrderById = (orderId) => {
    return orders?.find(order => order.OrderId.toString() === orderId.toString());
  };

  const getOrdersByStatus = (status) => {
    return orders?.filter(order => order.Status === status) || [];
  };

  const getRecentOrders = (limit = 5) => {
    if (!orders) return [];
    
    return orders
      .sort((a, b) => new Date(b.OrderDate) - new Date(a.OrderDate))
      .slice(0, limit);
  };

  const getTotalSpent = () => {
    return orders?.reduce((total, order) => total + order.TotalAmount, 0) || 0;
  };

  return {
    orders: orders || [],
    isLoading,
    error,
    refetch,
    getOrderById,
    getOrdersByStatus,
    getRecentOrders,
    getTotalSpent,
    totalOrders: orders?.length || 0
  };
};

export const useOrderManagement = () => {
  const queryClient = useQueryClient();
  
  const createMutation = useMutation(
    (orderData) => orderService.createOrder(orderData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders');
        queryClient.invalidateQueries('products'); // Invalidate products because stock changes
      },
    }
  );

  const cancelMutation = useMutation(
    (orderId) => orderService.cancelOrder(orderId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders');
      },
    }
  );

  const createOrder = async (orderData) => {
    return await createMutation.mutateAsync(orderData);
  };

  const cancelOrder = async (orderId) => {
    return await cancelMutation.mutateAsync(orderId);
  };

  return {
    createOrder,
    cancelOrder,
    isLoading: createMutation.isLoading || cancelMutation.isLoading,
    error: createMutation.error || cancelMutation.error
  };
};