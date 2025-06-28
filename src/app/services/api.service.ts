import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface User {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://jsonplaceholder.typicode.com/users';
  private cachedTags: string[] = [];
  private tagsSubject = new BehaviorSubject<string[]>([]);

  constructor(private http: HttpClient) {}

  getTags(): Observable<string[]> {
    if (this.cachedTags.length > 0) {
      return of(this.cachedTags);
    }

    return this.http.get<User[]>(this.apiUrl).pipe(
      map(users => users.slice(0, 10).map(user => user.name)),
      map(tags => {
        this.cachedTags = tags;
        this.tagsSubject.next(tags);
        return tags;
      }),
      catchError(() => {
        const fallbackTags: string[] = [];
        this.tagsSubject.next(fallbackTags);
        return of(fallbackTags);
      })
    );
  }
}