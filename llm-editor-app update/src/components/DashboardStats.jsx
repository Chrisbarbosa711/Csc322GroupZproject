import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { useFetchTokenStats } from "../costumeQuerys/tokenQuery";
import { useDocumentStats } from "../costumeQuerys/DocumentQuery";
import { FaFileAlt, FaCoins, FaGift } from "react-icons/fa";
import { BiSolidPencil } from "react-icons/bi";

export default function DashboardStats() {
  const { userInfo } = useAuth();
  const { tokenStats } = useFetchTokenStats();
  const { data: docStats } = useDocumentStats();
  
  const statItems = [
    {
      label: "Words",
      value: docStats?.stats?.total_words || 0,
      icon: <BiSolidPencil className="text-blue-500" />,
      description: "Total edited"
    },
    {
      label: "Documents",
      value: docStats?.stats?.total_documents || 0,
      icon: <FaFileAlt className="text-green-500" />,
      description: "Created"
    },
    {
      label: "Tokens",
      value: userInfo?.tokens || 0,
      icon: <FaCoins className="text-amber-500" />,
      description: "Available"
    },
    {
      label: "Rewards",
      value: tokenStats?.data?.reward || 0,
      icon: <FaGift className="text-purple-500" />,
      description: "Earned"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((stat, index) => (
            <div key={index} className="flex space-x-2">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.label} {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 