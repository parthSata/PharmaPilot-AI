import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { resetComplaint } from '../store/complaintSlice';
import { resetChat } from '../store/chatSlice';

export const useComplaintForm = () => {
  const dispatch = useAppDispatch();
  const complaint = useAppSelector((state) => state.complaint);

  const handleReset = useCallback(() => {
    dispatch(resetComplaint());
    dispatch(resetChat());
  }, [dispatch]);

  return {
    complaint,
    handleReset,
  };
};
