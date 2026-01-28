import { useSelector } from 'react-redux';

const useRoleBasedMessageCounts = () => {
  // Get role-based counts directly from Redux
  const { roleBased } = useSelector((state) => state.messageCount || { roleBased: {} });
  
  const roleCounts = {
    account_executive: roleBased.account_executive || 0,
    company_admin: roleBased.company_admin || 0,
  };

  return {
    roleCounts,
  };
};

export default useRoleBasedMessageCounts;
