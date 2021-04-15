import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BatchModeComponent } from './batch-mode/batch-mode.component';
import { SimpleModeComponent } from './simple-mode/simple-mode.component';

const routes: Routes = [
  {path: '', component: BatchModeComponent},
  {path: 'simple-mode', component: SimpleModeComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
