import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvModal } from './csv-modal';

describe('CsvModal', () => {
  let component: CsvModal;
  let fixture: ComponentFixture<CsvModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CsvModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsvModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
