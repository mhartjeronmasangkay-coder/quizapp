import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { provideApollo } from 'apollo-angular';
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),

    provideApollo(() => {
      // 1. Setup the upload link pointing to your dynamic environment URL
      const uploadLink = new UploadHttpLink({
        uri: environment.graphqlUrl
      }) as unknown as ApolloLink;

      // 2. Setup your authentication headers context
      const authLink = setContext((_, { headers }) => {
        const token = sessionStorage.getItem('auth_token');
        return {
          headers: {
            ...headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        };
      });

      // 3. Return the merged Apollo configuration
      return {
        link: authLink.concat(uploadLink),
        cache: new InMemoryCache(),
      };
    }),
  ]
};
