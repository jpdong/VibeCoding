import { getServerSession } from "next-auth";
import { authOptions } from "./auth-config";

// Re-export authOptions for backward compatibility
export { authOptions };

export const auth = {
  api: {
    getSession: async ({ headers }: { headers: any }) => {
      return await getServerSession(authOptions);
    }
  }
};