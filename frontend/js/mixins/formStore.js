import { mapState } from 'vuex'
import { FORM } from '@/store/mutations'

export default {
  props: {
    hasDefaultStore: {
      type: Boolean,
      default: false
    },
    inModal: {
      type: Boolean,
      default: false
    },
    inStore: {
      type: String,
      default: ''
    },
    fieldName: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapState({
      submitting: state => state.form.loading,
      fields: state => state.form.fields, // Fields in the form
      modalFields: state => state.form.modalFields // Fields in the create/edit modal
    })
  },
  methods: {
    getFieldName: function () {
      return this.fieldName !== '' ? this.fieldName : this.name
    },
    // Save the value into the store
    saveIntoStore: function (value) {
      if (this.inStore === '') return

      let newValue = ''

      if (value) newValue = value
      else newValue = this[this.inStore]

      // The object that is saved
      const field = {}
      field.name = this.getFieldName()
      field.value = newValue
      if (this.locale) field.locale = this.locale.value

      // in Modal or in Form
      if (this.inModal) this.$store.commit(FORM.UPDATE_MODAL_FIELD, field)
      else this.$store.commit(FORM.UPDATE_FORM_FIELD, field)
    }
  },
  beforeMount: function () {
    const fieldName = this.getFieldName()

    if (this.inStore === '') return
    if (fieldName === '') return

    const fields = this.inModal ? this.modalFields : this.fields

    const fieldInStore = fields.filter(function (field) {
      return field.name === fieldName
    })

    if (fieldInStore.length) {
      // init value with the one from the store

      if (this.locale) {
        this[this.inStore] = fieldInStore[0].value[this.locale.value]
      } else {
        this[this.inStore] = fieldInStore[0].value
      }
    } else if (this.hasDefaultStore) {
      // init value with the one present into the component itself
      this.saveIntoStore()
    }
  },
  beforeDestroy: function () {
    if (this.inStore !== '') {
      // Delete form field from store because the field has been removed
      if (this.inModal) this.$store.commit(FORM.REMOVE_MODAL_FIELD, this.getFieldName())
      else this.$store.commit(FORM.REMOVE_FORM_FIELD, this.getFieldName())
    }
  }
}
