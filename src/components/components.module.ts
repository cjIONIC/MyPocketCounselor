import { NgModule } from '@angular/core';
import { PopFilterComponent } from './pop-filter/pop-filter';
import { ModalStudentUpdateComponent } from './modal-student-update/modal-student-update';
import { ModalProfileComponent } from './modal-profile/modal-profile';
import { PopScheduleComponent } from './pop-schedule/pop-schedule';
import { ModalScheduleComponent } from './modal-schedule/modal-schedule';
import { ModalRequestComponent } from './modal-request/modal-request';
import { ModalNotificationComponent } from './modal-notification/modal-notification';
import { ModalFeedbackAddComponent } from './modal-feedback-add/modal-feedback-add';
import { ModalAppointmentSearchComponent } from './modal-appointment-search/modal-appointment-search';
import { ModalPasswordComponent } from './modal-password/modal-password';
import { PopProfileEditComponent } from './pop-profile-edit/pop-profile-edit';
import { ModalProfileEditComponent } from './modal-profile-edit/modal-profile-edit';
import { ModalStatisticsComponent } from './modal-statistics/modal-statistics';
import { ModalConcernsAddComponent } from './modal-concerns-add/modal-concerns-add';
import { ModalCounselorsProfileComponent } from './modal-counselors-profile/modal-counselors-profile';
import { ModalCounselorsAcademicComponent } from './modal-counselors-academic/modal-counselors-academic';
@NgModule({
	declarations: [PopFilterComponent,
    ModalStudentUpdateComponent,
    ModalProfileComponent,
    PopScheduleComponent,
    ModalScheduleComponent,
    ModalRequestComponent,
    ModalNotificationComponent,
    ModalFeedbackAddComponent,
    ModalAppointmentSearchComponent,
    ModalPasswordComponent,
    PopProfileEditComponent,
    ModalProfileEditComponent,
    ModalStatisticsComponent,
    ModalConcernsAddComponent,
    ModalCounselorsProfileComponent,
    ModalCounselorsAcademicComponent],
	imports: [],
	exports: [PopFilterComponent,
    ModalStudentUpdateComponent,
    ModalProfileComponent,
    PopScheduleComponent,
    ModalScheduleComponent,
    ModalRequestComponent,
    ModalNotificationComponent,
    ModalFeedbackAddComponent,
    ModalAppointmentSearchComponent,
    ModalPasswordComponent,
    PopProfileEditComponent,
    ModalProfileEditComponent,
    ModalStatisticsComponent,
    ModalConcernsAddComponent,
    ModalCounselorsProfileComponent,
    ModalCounselorsAcademicComponent]
})
export class ComponentsModule {}
