import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { provideApollo } from 'apollo-angular';
import  UploadHttpLink  from 'apollo-upload-client/UploadHttpLink.mjs';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideApollo(() => {
      let graphqlUrl = 'http://localhost:8000/graphql';
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        graphqlUrl = 'http://nginx/graphql';
      }
     const uploadLink = new UploadHttpLink({ uri: graphqlUrl }) as unknown as ApolloLink;

      const authLink = setContext((_, { headers }) => {
        const token = sessionStorage.getItem('auth_token');
        return {
          headers: {
            ...headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        };
      });

      return {
        link: authLink.concat(uploadLink),
        cache: new InMemoryCache(),
      };
    }),
  ]
};
