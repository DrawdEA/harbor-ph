"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Building2, Mail, Shield, Trash2 } from "lucide-react";
import ProfilePictureUpload from "@/components/shared/ProfilePictureUpload";

interface OrganizationProfile {
	id: string;
	name: string;
	description?: string;
	websiteUrl?: string;
	contactEmail?: string;
	contactNumber?: string;
	profilePictureUrl?: string | null;
	createdAt: string;
	updatedAt: string;
}

export default function SettingsPage() {
	const [orgProfile, setOrgProfile] = useState<OrganizationProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchOrgProfile() {
			try {
				const supabase = createClient();
				const { data: { user } } = await supabase.auth.getUser();
				
				if (!user) return;

				// Fetch organization profile
				const { data: profile } = await supabase
					.from('organization_profiles')
					.select('*')
					.eq('id', user.id)
					.single();

				setOrgProfile(profile);
			} catch (error) {
				console.error('Error fetching organization profile:', error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchOrgProfile();
	}, []);

	const handleProfilePictureUpdate = (newUrl: string | null) => {
		setOrgProfile((prev) => prev ? {
			...prev,
			profilePictureUrl: newUrl
		} : null);
	};

	if (isLoading) {
		return (
			<div className="space-y-6 p-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
					<p className="text-muted-foreground">
						Manage your organization profile and account settings.
					</p>
				</div>
				<div className="text-center py-8 text-muted-foreground">
					<p>Loading settings...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6">
			{/* Page Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
				<p className="text-muted-foreground">
					Manage your organization profile and account settings.
				</p>
			</div>

			<div className="grid gap-6">
				{/* Organization Profile */}
				<Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Building2 className="h-5 w-5" />
							Organization Profile
						</CardTitle>
						<CardDescription>
							Update your organization&apos;s public information.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="orgName">Organization Name</Label>
								<Input 
									id="orgName" 
									defaultValue={orgProfile?.name || ''} 
									placeholder="Enter organization name"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="website">Website URL</Label>
								<Input 
									id="website" 
									defaultValue={orgProfile?.websiteUrl || ''} 
									placeholder="https://your-website.com"
									type="url"
								/>
							</div>
						</div>
						
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea 
								id="description" 
								defaultValue={orgProfile?.description || ''} 
								placeholder="Describe your organization..."
								rows={4}
							/>
						</div>
						
						<Button>Save Changes</Button>
					</CardContent>
				</Card>

				{/* Organization Logo */}
				<ProfilePictureUpload
					currentProfilePictureUrl={orgProfile?.profilePictureUrl || null}
					fullName={orgProfile?.name || 'Organization'}
					onUpdate={handleProfilePictureUpdate}
					type="organization"
					storageBucket="avatars"
					tableName="organization_profiles"
				/>

				{/* Contact Information */}
				<Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Mail className="h-5 w-5" />
							Contact Information
						</CardTitle>
						<CardDescription>
							Update your organization&apos;s contact details.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="contactEmail">Contact Email</Label>
								<Input 
									id="contactEmail" 
									defaultValue={orgProfile?.contactEmail || ''} 
									placeholder="contact@organization.com"
									type="email"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="contactPhone">Contact Phone</Label>
								<Input 
									id="contactPhone" 
									defaultValue={orgProfile?.contactNumber || ''} 
									placeholder="+1 (555) 123-4567"
									type="tel"
								/>
							</div>
						</div>
						
						<Button>Update Contact Info</Button>
					</CardContent>
				</Card>

				{/* Account Security */}
				<Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="h-5 w-5" />
							Account Security
						</CardTitle>
						<CardDescription>
							Manage your account password and security settings.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="currentPassword">Current Password</Label>
							<Input 
								id="currentPassword" 
								type="password"
								placeholder="Enter current password"
							/>
						</div>
						
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="newPassword">New Password</Label>
								<Input 
									id="newPassword" 
									type="password"
									placeholder="Enter new password"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Confirm New Password</Label>
								<Input 
									id="confirmPassword" 
									type="password"
									placeholder="Confirm new password"
								/>
							</div>
						</div>
						
						<Button>Change Password</Button>
					</CardContent>
				</Card>

				{/* Danger Zone */}
				<Card className="font-roboto border-destructive bg-background flex w-full flex-col overflow-hidden rounded-md border shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-destructive">
							<Trash2 className="h-5 w-5" />
							Danger Zone
						</CardTitle>
						<CardDescription>
							Irreversible and destructive actions.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="rounded-lg border border-destructive/20 p-4">
							<h4 className="font-medium mb-2">Delete Organization Account</h4>
							<p className="text-sm text-muted-foreground mb-4">
								Once you delete your organization account, there is no going back. 
								This will permanently delete all your events, data, and remove your organization from the platform.
							</p>
							<Button variant="destructive">
								Delete Organization Account
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
