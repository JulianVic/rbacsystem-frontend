// access.service.ts
import { Injectable } from '@angular/core';

interface AccessRequirement {
  role: string;
  experienceLevel: string;
}

interface AccessRequirements {
  [key: string]: AccessRequirement[];
}

@Injectable({
  providedIn: 'root'
})
export class AccessService {
  private accessRequirements: AccessRequirements = {
    'reset_line': [
      { role: "support", experienceLevel: "junior" },
      { role: "gerent", experienceLevel: "junior" },
    ],
    'test_connectivity': [
      { role: "support", experienceLevel: "junior" },
      { role: "facilities", experienceLevel: "junior" },
      { role: "gerent", experienceLevel: "junior" },
    ],
    'facture': [
      { role: "admin", experienceLevel: "junior" },
      { role: "gerent", experienceLevel: "junior" },
    ]
  };

  hasAccess(operation: string, userRoles: any): boolean {
    if (!this.accessRequirements[operation]) return false;
    
    const userRole = userRoles?.role;
    const userExperience = userRoles?.experienceLevel;
    
    return this.accessRequirements[operation].some(requirement => 
      requirement.role === userRole && 
      requirement.experienceLevel === userExperience
    );
  }
}