import { NgModule } from '@angular/core';
import { PopFilterComponent } from './pop-filter/pop-filter';
import { ModalStudentUpdateComponent } from './modal-student-update/modal-student-update';
import { ModalSearchComponent } from './modal-search/modal-search';
import { ModalProfileComponent } from './modal-profile/modal-profile';
import { PopScheduleComponent } from './pop-schedule/pop-schedule';
import { ModalScheduleComponent } from './modal-schedule/modal-schedule';
import { ModalRequestComponent } from './modal-request/modal-request';
import { ModalNotificationComponent } from './modal-notification/modal-notification';
import { FeedbackAddComponent } from './feedback-add/feedback-add';
import { ModalFeedbackAddComponent } from './modal-feedback-add/modal-feedback-add';
@NgModule({
	declarations: [PopFilterComponent,
    ModalStudentUpdateComponent,
    ModalSearchComponent,
    ModalProfileComponent,
    PopScheduleComponent,
    ModalScheduleComponent,
    ModalRequestComponent,
    ModalNotificationComponent,
    FeedbackAddComponent,
    ModalFeedbackAddComponent],
	imports: [],
	exports: [PopFilterComponent,
    ModalStudentUpdateComponent,
    ModalSearchComponent,
    ModalProfileComponent,
    PopScheduleComponent,
    ModalScheduleComponent,
    ModalRequestComponent,
    ModalNotificationComponent,
    FeedbackAddComponent,
    ModalFeedbackAddComponent]
})
export class ComponentsModule {}
