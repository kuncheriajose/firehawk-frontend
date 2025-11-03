import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="app-container">
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: var(--bg-light);
      width: 100%;
    }

    .app-main {
      width: 100%;
      max-width: 100%;
      padding: 1rem;
    }

    /* Tablet and up */
    @media (min-width: 768px) {
      .app-main {
        padding: 1.5rem;
      }
    }

    /* Desktop */
    @media (min-width: 1024px) {
      .app-main {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }
    }
  `]
})
export class AppComponent {
  title = 'car-database-frontend';
}

