import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.getCurrentUser();
    const requiredRole = route.data['role'];

    if (currentUser && currentUser.role === requiredRole) {
      return true;
    }

    // Rediriger vers le tableau de bord approprié si l'utilisateur est connecté mais n'a pas le bon rôle
    if (currentUser) {
      const redirectPath = currentUser.role === 'PROFESSOR' ? '/professor/dashboard' : '/student/dashboard';
      this.router.navigate([redirectPath]);
    } else {
      this.router.navigate(['/login']);
    }

    return false;
  }
} 