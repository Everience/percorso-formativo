import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlassElem } from './glass-elem';

describe('GlassElem', () => {
  let component: GlassElem;
  let fixture: ComponentFixture<GlassElem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlassElem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlassElem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
