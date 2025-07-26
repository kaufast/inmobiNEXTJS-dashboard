import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { PropertyTourService } from "@/lib/property-tour-service";
import { format, parseISO } from "date-fns";
import { PropertyTour } from "@shared/schema";
import { 
  Calendar,
  Clock,
  Home,
  User,
  Check,
  X,
  Ban,
  AlertCircle,
  Loader2
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

interface PropertyToursListProps {
  type: "user" | "agent" | "property";
  userId?: number;
  agentId?: number;
  propertyId?: number;
}

export default function PropertyToursList({ type, userId, agentId, propertyId }: PropertyToursListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation('dashboard');
  const queryClient = useQueryClient();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"confirm" | "complete" | "cancel" | null>(null);
  
  // Calculate query key based on type
  const getQueryKey = () => {
    switch (type) {
      case "user":
        return ["property-tours", "user", userId || user?.id];
      case "agent":
        return ["property-tours", "agent", agentId || user?.id];
      case "property":
        return ["property-tours", "property", propertyId];
      default:
        return ["property-tours"];
    }
  };
  
  // Fetch tours based on type
  const { data: tours, isLoading, isError } = useQuery({
    queryKey: getQueryKey(),
    queryFn: async () => {
      switch (type) {
        case "user":
          return await PropertyTourService.getUserTours(userId || user?.id!);
        case "agent":
          return await PropertyTourService.getAgentTours(agentId || user?.id!);
        case "property":
          return propertyId ? await PropertyTourService.getPropertyTours(propertyId) : [];
        default:
          return [];
      }
    },
    enabled: !!user && (!!userId || !!agentId || !!propertyId || type === "user" || type === "agent"),
  });
  
  // Mutation for updating tour status
  const updateTourStatusMutation = useMutation({
    mutationFn: async ({id, status}: {id: number, status: string}) => {
      return await PropertyTourService.updateTourStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: getQueryKey()});
      
      // Show success toast based on action type
      const successMessage = actionType === "confirm" 
        ? "Tour confirmed successfully" 
        : actionType === "complete"
          ? "Tour marked as completed"
          : "Tour canceled successfully";
          
      toast({
        title: successMessage,
        variant: "default",
        className: "bg-green-50 text-green-800 border-green-300",
      });
      
      setSelectedTourId(null);
      setActionType(null);
      setConfirmDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating tour status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation for canceling a tour
  const cancelTourMutation = useMutation({
    mutationFn: async (id: number) => {
      return await PropertyTourService.cancelTour(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: getQueryKey()});
      toast({
        title: "Tour canceled successfully",
        variant: "default",
        className: "bg-amber-50 text-amber-800 border-amber-300",
      });
      setSelectedTourId(null);
      setActionType(null);
      setConfirmDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error canceling tour",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleActionClick = (tourId: number, action: "confirm" | "complete" | "cancel") => {
    setSelectedTourId(tourId);
    setActionType(action);
    setConfirmDialogOpen(true);
  };
  
  const confirmAction = () => {
    if (!selectedTourId || !actionType) return;
    
    if (actionType === "cancel") {
      cancelTourMutation.mutate(selectedTourId);
    } else {
      const status = actionType === "confirm" ? "confirmed" : "completed";
      updateTourStatusMutation.mutate({id: selectedTourId, status});
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">{t('tours.statusLabels.pending')}</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">{t('tours.statusLabels.confirmed')}</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">{t('tours.statusLabels.completed')}</Badge>;
      case "canceled":
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-300">{t('tours.statusLabels.canceled')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="text-lg font-semibold">
            <Skeleton className="h-6 w-64" />
          </div>
          <div className="text-sm text-muted-foreground">
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {t('errors.notFound.title')}
          </CardTitle>
          <CardDescription>
            {t('errors.notFound.message')}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => queryClient.invalidateQueries({queryKey: getQueryKey()})}
          >
            {t('general.retry')}
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Empty state
  if (!tours || tours.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('tours.notFound.title')}</CardTitle>
          <CardDescription>
            {type === "user" 
              ? t('tours.notFound.userMessage')
              : type === "agent"
                ? t('tours.notFound.agentMessage')
                : t('tours.notFound.propertyMessage')
            }
          </CardDescription>
        </CardHeader>
        <CardFooter>
          {type === "user" && (
            <Button asChild>
              <Link href="/search">{t('errors.noFavorites.buttonText')}</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {type === "user" 
              ? t('tours.title') 
              : type === "agent" 
                ? t('tours.agentTitle')
                : t('tours.propertyTitle')
            }
          </CardTitle>
          <CardDescription>
            {type === "user" 
              ? t('tours.description')
              : type === "agent"
                ? t('tours.agentDescription')
                : t('tours.propertyDescription')
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('tours.tableHeaders.property')}</TableHead>
                {type !== "user" && <TableHead>{t('tours.tableHeaders.client')}</TableHead>}
                {type !== "agent" && <TableHead>{t('tours.tableHeaders.agent')}</TableHead>}
                <TableHead>{t('tours.tableHeaders.dateTime')}</TableHead>
                <TableHead>{t('tours.tableHeaders.status')}</TableHead>
                <TableHead className="text-right">{t('tours.tableHeaders.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tours.map((tour: PropertyTour) => (
                <TableRow key={tour.id}>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <Home className="h-4 w-4 mt-1" />
                      <div>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Link href={`/property/${tour.propertyId}`} className="font-medium hover:underline inline-block">
                              {t('tours.propertyLink', {id: tour.propertyId})}
                            </Link>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="flex justify-between space-x-4">
                              <div>
                                <h4 className="text-sm font-semibold">{t('tours.hoverCard.title')}</h4>
                                <p className="text-sm">{t('tours.hoverCard.description')}</p>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    </div>
                  </TableCell>
                  
                  {type !== "user" && (
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 mt-1" />
                        <div>User #{tour.userId}</div>
                      </div>
                    </TableCell>
                  )}
                  
                  {type !== "agent" && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>Agent #{tour.agentId || "Unassigned"}</div>
                      </div>
                    </TableCell>
                  )}
                  
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{format(parseISO(tour.scheduledDate.toString()), "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{format(parseISO(tour.scheduledDate.toString()), "h:mm a")}</span>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getStatusBadge(tour.status)}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* Agent actions */}
                      {type === "agent" && tour.status === "pending" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => handleActionClick(tour.id, "confirm")}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          {t('tours.actions.confirm')}
                        </Button>
                      )}
                      
                      {type === "agent" && tour.status === "confirmed" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleActionClick(tour.id, "complete")}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          {t('tours.actions.complete')}
                        </Button>
                      )}
                      
                      {/* Actions for both user and agent */}
                      {(tour.status === "pending" || tour.status === "confirmed") && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleActionClick(tour.id, "cancel")}
                        >
                          <X className="h-4 w-4 mr-1" />
                          {t('tours.actions.cancel')}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === "confirm" 
                ? t('tours.dialog.confirmTitle')
                : actionType === "complete" 
                  ? t('tours.dialog.completeTitle')
                  : t('tours.dialog.cancelTitle')}
            </DialogTitle>
            <DialogDescription>
              {actionType === "confirm" 
                ? t('tours.dialog.confirmDescription')
                : actionType === "complete"
                  ? t('tours.dialog.completeDescription')
                  : t('tours.dialog.cancelDescription')
              }
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              {t('general.cancel')}
            </Button>
            <Button
              variant={actionType === "cancel" ? "destructive" : "default"}
              className={actionType !== "cancel" ? "bg-black text-white hover:bg-gray-800" : ""}
              onClick={confirmAction}
              disabled={updateTourStatusMutation.isPending || cancelTourMutation.isPending}
            >
              {(updateTourStatusMutation.isPending || cancelTourMutation.isPending) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('tours.actions.processing')}
                </>
              ) : (
                actionType === "confirm" 
                  ? t('tours.actions.confirm')
                  : actionType === "complete" 
                    ? t('tours.actions.complete')
                    : t('tours.actions.cancel')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}