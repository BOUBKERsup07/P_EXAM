import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent {
  demoSteps = [
    {
      title: "Création d'examen",
      description: "Créez facilement vos examens avec notre interface intuitive",
      icon: "fa-file-alt"
    },
    {
      title: "Passation d'examen",
      description: "Les étudiants peuvent passer l'examen en temps réel",
      icon: "fa-laptop-code"
    },
    {
      title: "Correction automatique",
      description: "Obtenez des résultats instantanés avec notre système de correction",
      icon: "fa-check-circle"
    }
  ];

  features = [
    "Interface conviviale",
    "Surveillance en temps réel",
    "Rapports détaillés",
  ];
}