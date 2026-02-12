import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dev } from './dev';

describe('Dev', () => {
  let component: Dev;
  let fixture: ComponentFixture<Dev>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dev]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dev);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
