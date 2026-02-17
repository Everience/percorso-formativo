import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UdemyAccessInstructions } from './udemy-access-instructions';

describe('UdemyAccessInstructions', () => {
  let component: UdemyAccessInstructions;
  let fixture: ComponentFixture<UdemyAccessInstructions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UdemyAccessInstructions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UdemyAccessInstructions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
