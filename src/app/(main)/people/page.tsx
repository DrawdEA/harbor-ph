"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Users } from "lucide-react";
import { IconBuilding, IconUser } from "@tabler/icons-react";
import ProfileCard from "@/components/people/ProfileCard";
import { UserProfile, OrganizationProfile } from "@/components/people/types";

export default function PeoplePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState<'all' | 'users' | 'organizations'>(
    (searchParams.get('type') as 'all' | 'users' | 'organizations') || 'all'
  );

  
  // Data state
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [organizationProfiles, setOrganizationProfiles] = useState<OrganizationProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredResults, setFilteredResults] = useState<(UserProfile | OrganizationProfile)[]>([]);



  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    // Initial load - show all results
    if (userProfiles.length > 0 || organizationProfiles.length > 0) {
      applyFilters();
    }
  }, [userProfiles, organizationProfiles]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      
      // Fetch user profiles
      console.log('Fetching user profiles...');
      const usersResponse = await fetch('/api/getAllUsers');
      const usersData = await usersResponse.json();
      console.log('Users response:', usersData);
      setUserProfiles(usersData.users || []);
      
      // Fetch organization profiles
      console.log('Fetching organization profiles...');
      const orgsResponse = await fetch('/api/organizations');
      const orgsData = await orgsResponse.json();
      console.log('Organizations response:', orgsData);
      setOrganizationProfiles(orgsData.organizations || []);
      
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    console.log('Applying filters...');
    console.log('User profiles:', userProfiles);
    console.log('Organization profiles:', organizationProfiles);
    console.log('Selected type:', selectedType);
    console.log('Search term:', searchTerm);
    
    const allResults: (UserProfile | OrganizationProfile)[] = [
      ...(selectedType === 'all' || selectedType === 'users' ? userProfiles : []),
      ...(selectedType === 'all' || selectedType === 'organizations' ? organizationProfiles : [])
    ];

    console.log('Combined results before filtering:', allResults);
    let filtered = allResults;

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(item => {
        if ('username' in item) {
          // User profile
          return (
            item.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        } else {
          // Organization profile
          return (
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.websiteUrl?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
      });
    }

    console.log('Final filtered results:', filtered);
    setFilteredResults(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    // Reset filtered results to show all profiles
    const allResults: (UserProfile | OrganizationProfile)[] = [
      ...userProfiles,
      ...organizationProfiles
    ];
    setFilteredResults(allResults);
    router.push('/people');
  };

  const hasActiveFilters = searchTerm || selectedType !== 'all';

  

  

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">People</h1>
          <p className="text-gray-600">
            {hasActiveFilters 
              ? `Found ${filteredResults.length} profile${filteredResults.length !== 1 ? 's' : ''} matching your filters`
              : `Discover people and organizations`
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border p-0 shadow-sm">
              <CardHeader className="px-6 pt-6">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {/* Type Filter */}
                <div className="space-y-4">
                  <Label className="font-semibold text-sm text-muted-foreground">Type</Label>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant={selectedType === 'all' ? 'default' : 'secondary'}
                      className="w-full justify-start"
                      onClick={() => setSelectedType('all')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      All
                    </Button>
                    <Button
                      variant={selectedType === 'users' ? 'default' : 'secondary'}
                      className="w-full justify-start"
                      onClick={() => setSelectedType('users')}
                    >
                      <IconUser className="h-4 w-4 mr-2" />
                      Users
                    </Button>
                    <Button
                      variant={selectedType === 'organizations' ? 'default' : 'secondary'}
                      className="w-full justify-start"
                      onClick={() => setSelectedType('organizations')}
                    >
                      <IconBuilding className="h-4 w-4 mr-2" />
                      Organizations
                    </Button>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Search */}
                <div className="space-y-4">
                  <Label className="font-semibold text-sm text-muted-foreground">Search</Label>
                  <Input
                    placeholder="Search names, descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>



                

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button onClick={applyFilters} className="w-full">
                    Apply Filters
                  </Button>
                  {hasActiveFilters && (
                    <Button 
                      onClick={clearFilters} 
                      variant="outline" 
                      className="w-full transition-all duration-200 ease-in-out animate-in slide-in-from-top-2"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
                         ) : filteredResults.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {filteredResults.map((item) => (
                   <ProfileCard key={item.id} profile={item} />
                 ))}
               </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles found</h3>
                <p className="text-gray-600 mb-4">
                  {hasActiveFilters 
                    ? "Try adjusting your filters or search terms"
                    : "No profiles are currently available"
                  }
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
