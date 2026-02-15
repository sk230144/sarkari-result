"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Crown, CrownIcon, Trash2, ShieldOff } from "lucide-react";
import { toggleUserPremium, deleteUser } from "@/lib/actions/users";
import type { UserProfile } from "@/lib/actions/users";
import { toast } from "sonner";

const PLAN_OPTIONS = [
  { value: "monthly", label: "Monthly (₹99)" },
  { value: "half-yearly", label: "Half-Yearly (₹500)" },
  { value: "yearly", label: "Yearly (₹900)" },
  { value: "lifetime", label: "Lifetime (₹5,000)" },
];

export function UserActions({ user }: { user: UserProfile }) {
  const router = useRouter();

  async function handleMakePremium(plan: string) {
    const result = await toggleUserPremium(user.id, true, plan);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`${user.full_name || user.email} is now Premium (${plan})`);
      router.refresh();
    }
  }

  async function handleRemovePremium() {
    const result = await toggleUserPremium(user.id, false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Premium removed");
      router.refresh();
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        `Are you sure you want to delete ${user.full_name || user.email}? This cannot be undone.`
      )
    )
      return;
    const result = await deleteUser(user.id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("User deleted");
      router.refresh();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {user.is_premium ? (
          <DropdownMenuItem onClick={handleRemovePremium}>
            <ShieldOff className="h-4 w-4 mr-2" />
            Remove Premium
          </DropdownMenuItem>
        ) : (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Crown className="h-4 w-4 mr-2" />
              Make Premium
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {PLAN_OPTIONS.map((plan) => (
                <DropdownMenuItem
                  key={plan.value}
                  onClick={() => handleMakePremium(plan.value)}
                >
                  <CrownIcon className="h-3.5 w-3.5 mr-2 text-violet-500" />
                  {plan.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
