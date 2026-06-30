import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { InMemoryCache } from '@apollo/client/core';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      
      // Determine GraphQL endpoint based on environment
      let graphqlUrl = 'http://localhost:8000/graphql';
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // In Docker containers, use the nginx service name
        graphqlUrl = 'http://nginx/graphql';
      }
      
      return {
        link: httpLink.create({ uri: graphqlUrl }),
        cache: new InMemoryCache(),
      };
    }),
  ]
};