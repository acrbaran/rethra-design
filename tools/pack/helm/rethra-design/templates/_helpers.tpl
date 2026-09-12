{{- /*
Rethra Design Helm chart helpers. Spec §15.5.

Names:
  rethra-design.name        chart-name (`rethra-design`)
  rethra-design.fullname    release-prefixed name (truncated to 63 chars)
  rethra-design.labels      common label set
  rethra-design.selectorLabels   selector subset
*/ -}}

{{- define "rethra-design.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "rethra-design.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "rethra-design.labels" -}}
app.kubernetes.io/name: {{ include "rethra-design.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" }}
{{- end -}}

{{- define "rethra-design.selectorLabels" -}}
app.kubernetes.io/name: {{ include "rethra-design.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
