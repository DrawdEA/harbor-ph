"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconBuilding, IconCalendar, IconGlobe, IconMail, IconPhone } from "@tabler/icons-react";
import { OrganizationProfile } from "@/components/people/types";
import { Event } from "@/lib/event-query";
import EventCard from "@/components/event/EventCard";

export default function OrganizationPage() {
  const params = useParams();
  const orgname = params.orgname as string;
  
  const [organization, setOrganization] = useState<OrganizationProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrganizationData();
  }, [orgname]);

  const loadOrganizationData = async () => {
    try {
      setLoading(true);
      
      // Fetch organization profile
      const orgResponse = await fetch('/api/organizations');
      const orgData = await orgResponse.json();
      const org = orgData.organizations?.find((o: OrganizationProfile) => o.name === orgname);
      
      if (org) {
        setOrganization(org);
        
        // Fetch events by this organization using organizerId
        const eventsResponse = await fetch('/api/events');
        const eventsData = await eventsResponse.json();
        const orgEvents = eventsData.events?.filter((event: Event) => 
          event.organizerId === org.id
        ) || [];
        
        setEvents(orgEvents);
      }
    } catch (error) {
      console.error('Error loading organization data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/40">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-muted/40">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Organization Not Found</h1>
            <p className="text-gray-600">The organization you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Organization Header */}
        <Card className="mb-8">
          <CardContent className="px-8 py-2">
            <div className="flex items-center gap-8">
              <Avatar className="h-32 w-32 flex-shrink-0">
                <AvatarImage 
                  src={organization.profilePictureUrl || undefined} 
                  alt={organization.name}
                  className="object-cover w-full h-full"
                />
                <AvatarFallback className="bg-muted text-3xl">
                  <IconBuilding className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
                  <Badge variant="outline">Organization</Badge>
                  {organization.isVerified && (
                    <Badge variant="default" className="bg-green-600">
                      Verified
                    </Badge>
                  )}
                </div>
                
                {organization.description && (
                  <p className="text-gray-600 text-lg mb-6">{organization.description}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {organization.contactEmail && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <IconMail className="h-4 w-4" />
                      <span>{organization.contactEmail}</span>
                    </div>
                  )}
                  
                  {organization.contactNumber && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <IconPhone className="h-4 w-4" />
                      <span>{organization.contactNumber}</span>
                    </div>
                  )}
                  
                  {organization.websiteUrl && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <IconGlobe className="h-4 w-4" />
                      <a 
                        href={organization.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {organization.websiteUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Events by {organization.name}</h2>
          
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <IconCalendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Yet</h3>
                <p className="text-gray-600">
                  {organization.name} hasn&apos;t created any events yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
