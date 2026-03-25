import api from '@/utils/axios';

const MorishopService = {
    checkSaldo: async () => {
        try {
            const response = await api.post('/api/morishop/balance');
            return response.data;
        } catch (error) {
            return error.response?.data || { status: false, msg: error.message };
        }
    },

    getServices: async () => {
        try {
            const response = await api.post('/api/morishop/services');
            return response.data;
        } catch (error) {
            return error.response?.data || { status: false, msg: error.message };
        }
    },

    createOrder: async (data) => {
        try {
            const response = await api.post('/api/morishop/order', data);
            return response.data;
        } catch (error) {
            return error.response?.data || { status: false, msg: error.message };
        }
    },

    checkStatus: async (orderId) => {
        try {
            const response = await api.post('/api/morishop/status', { order_id: orderId });
            return response.data;
        } catch (error) {
            return error.response?.data || { status: false, msg: error.message };
        }
    }
};

export default MorishopService;
