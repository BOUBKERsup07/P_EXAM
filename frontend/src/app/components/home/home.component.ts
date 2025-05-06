import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class HomeComponent implements OnInit, AfterViewInit {
  // Image path with fallback handling
  mainImagePath = 'assets/images/online-exame1.png';
  imageLoaded = false;
  
  // Animation states
  isHeroVisible = true;
  isFeaturesVisible = false;
  isFinalCtaVisible = false;
  
  // Floating elements animation control
  floatingElementsVisible = true;
  
  constructor(private router: Router) {}
  
  ngOnInit() {
    // Verify image exists
    this.checkImageExists();
  }
  
  ngAfterViewInit() {
    // Setup intersection observers for scroll animations
    this.setupScrollObservers();
    
    // Initial animation delay for floating elements
    setTimeout(() => {
      this.animateFloatingCards();
    }, 500);
  }
  
  /**
   * Check if the hero image exists and load a fallback if not
   */
  private checkImageExists() {
    const img = new Image();
    
    img.onload = () => {
      this.imageLoaded = true;
    };
    
    img.onerror = () => {
      console.warn('Image not found:', this.mainImagePath);
      // Use a placeholder image as fallback
      this.mainImagePath = 'https://via.placeholder.com/600x400?text=Exam+Platform';
      this.imageLoaded = true;
    };
    
    img.src = this.mainImagePath;
  }
  
  /**
   * Setup intersection observers for scroll-based animations
   */
  private setupScrollObservers() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      // Observer for features section
      const featuresObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this.isFeaturesVisible = true;
          }
        },
        { threshold: 0.2 }
      );
      
      // Observer for final CTA section
      const finalCtaObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this.isFinalCtaVisible = true;
          }
        },
        { threshold: 0.2 }
      );
      
      // Allow DOM to render first
      setTimeout(() => {
        const featuresSection = document.querySelector('.features-section');
        const finalCta = document.querySelector('.final-cta');
        
        if (featuresSection) {
          featuresObserver.observe(featuresSection);
        }
        
        if (finalCta) {
          finalCtaObserver.observe(finalCta);
        }
      }, 100);
    }
  }
  
  /**
   * Add staggered animation to floating cards
   */
  private animateFloatingCards() {
    const cards = document.querySelectorAll('.floating-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('visible');
      }, index * 200);
    });
  }
  
  /**
   * Handle scroll events for parallax effects
   */
  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (window.scrollY > 100) {
      this.floatingElementsVisible = false;
    } else {
      this.floatingElementsVisible = true;
    }
  }

  /**
   * Navigate to login page
   */
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  
  /**
   * Navigate to registration page
   */
  navigateToRegister() {
    this.router.navigate(['/register']);
  }
  
  /**
   * Navigate to demo page
   */
  navigateToDemo() {
    this.router.navigate(['/demo']);
  }
  
  /**
   * Handle when user clicks on a feature card
   * @param featureType The type of feature that was clicked
   */
  onFeatureClick(featureType: string) {
    console.log(`Feature clicked: ${featureType}`);
    
    switch (featureType) {
      case 'professor':
        this.router.navigate(['/features/professors']);
        break;
      case 'student':
        this.router.navigate(['/features/students']);
        break;
      case 'results':
        this.router.navigate(['/features/results']);
        break;
      default:
        this.navigateToDemo();
    }
  }
} 