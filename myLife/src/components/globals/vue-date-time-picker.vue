<template>
    <v-menu :close-on-content-click="false" :model-value="showMenu"
        @update:model-value="$emit('update:showMenu', $event)">
        <template #activator="{ props }">
            <v-text-field v-show="!hideInputField" v-bind="props" v-model="textFieldValue" dense :label="label"
                :disabled="disabled" @update:model-value="changeFromTextField()" />
            <div v-show="hideInputField" v-bind="props" />
        </template>
        <VueDatePicker v-model="pValue" :range="isRange" :auto-apply="!isTimePicker"
            :enable-time-picker="isTimePicker ? true : false" :model-type="isTimePicker ? 'HH:mm' : 'dd.MM.yyyy'"
            :format="isTimePicker ? 'HH:mm' : 'dd.MM.yyyy'" locale="de" inline :disabled="disabled"
            data-test="date-picker" menu-class-name="customCard" :month-change-on-scroll="false"
            @update:model-value="onChangeDateOrTimePicker()">
            <template v-if="isTimePicker" #action-row="{ selectDate, closePicker }">
                <v-row class="mt-n8 action-row">
                    <v-col cols="6">
                        <v-btn class="cancel-button pt-1" title="Abbrechen" text="Abbrechen" @click="closePicker" />
                    </v-col> <v-col cols="6">
                        <v-btn class="select-button pt-1" title="Übernehmen" text="Übernehmen" @click="selectDate" />
                    </v-col>
                </v-row>
            </template>
        </VueDatePicker>
    </v-menu>
</template>
<script>
export default {
    name: 'GlobalDateTimePicker',
    props: {
        modelValue: {
            type: [Array, String], // array for ranges, string for non-ranges
            required: true,
        },
        mode: {
            type: String,
            default: 'datepicker', /* -> default; only one date modelValue is String
       'datePickerFrom', 'datePickerTo'  -> only date; range; modelValue is array
       'timePickerFrom', 'timePickerTo' -> only time; range; modelValue is array
       'timePicker' -> only one time; modelValue is String
       */
        },
        disabled: { type: Boolean, default: false },
        hideInputField: { type: Boolean, default: false },
        label: {
            type: String,
            default: '',
        },
        showMenu: { type: Boolean, default: false },

    },
    emits: ['update:modelValue', 'newDate', 'update:showMenu'],
    data() {
        return {
            pValue: this.modelValue,
            textFieldValue: '',
        };
    },
    computed: {
        isTimePicker() {
            return this.mode.includes('time');
        },
        isRange() {
            return this.mode.includes('From') || this.mode.includes('To');
        },
    },
    watch: {
        modelValue: {
            deep: true,
            handler(newV) {
                this.pValue = newV;
                this.setTextFieldValue();
            },
        },
    },
    mounted() {
        this.setTextFieldValue();
    },
    methods: {
        setTextFieldValue() {
            if (this.mode.includes('From')) {
                if (this.modelValue[0] instanceof Date) {
                    return this.modelValue[0].toString();
                }
                this.textFieldValue = this.modelValue[0];
            } else if (this.mode.includes('To')) {
                if (this.modelValue[1] instanceof Date) {
                    return this.modelValue[1].toString();
                }
                this.textFieldValue = this.modelValue[1];
            } else {
                this.textFieldValue = this.modelValue;
            }

        },
        changeFromTextField() {
            if (this.isRange) {
                if (this.pValue[0] !== this.textFieldValue && this.mode.includes('From')) {
                    this.pValue[0] = this.textFieldValue;
                    this.onChangeDateOrTimePicker();
                } else if (this.pValue[1] !== this.textFieldValue && this.mode.includes('To')) {
                    this.pValue[1] = this.textFieldValue;
                    this.onChangeDateOrTimePicker();
                }
            } else if (this.pValue !== this.textFieldValue) {
                this.pValue = this.textFieldValue;
                this.onChangeDateOrTimePicker();
            }
        },
        onChangeDateOrTimePicker() {
            if (!_.isEqual(this.modelValue, this.pValue)) {
                this.$emit('update:modelValue', this.pValue);
                this.$emit('newDate', this.pValue);
            }
        },

    },


};
</script>
<style>
.time-picker-wrapper [aria-label="Calendar wrapper"] {
    height: 155px !important;
}

.dp__theme_light {
    --dp-primary-color: rgb(var(--v-theme-primary)) !important;
    --dp-highlight-color: rgb(var(--v-theme-primary)) !important;
}

:root {
    --dp-font-family: 'Source Sans Pro' !important;
    --dp-font-size: 14px !important;
}
</style>
