<template>
  <div>
    <div style="margin-bottom:24px;">
      <h1 style="color:white;margin-bottom:8px;">交换记录</h1>
      <p style="color:rgba(255,255,255,0.8);">查看你完成的所有交换和面交预约</p>
    </div>

    <div v-if="loading" style="text-align:center;padding:60px;color:white;">
      加载中...
    </div>

    <div v-else-if="exchanges.length === 0" class="empty-state card">
      <h2>暂无交换记录</h2>
      <p style="margin-bottom:20px;">去市场看看，寻找心仪的盲盒吧！</p>
      <router-link to="/">
        <button class="btn btn-primary">浏览盲盒市场</button>
      </router-link>
    </div>

    <div v-else class="exchange-list">
      <div v-for="exc in exchanges" :key="exc.id" class="exchange-card card">
        <div class="card-header">
          <div class="card-date">
            <div class="date-day">{{ formatDay(exc.createdAt) }}</div>
            <div class="date-month">{{ formatMonth(exc.createdAt) }}</div>
          </div>
          <div class="card-title">
            <span class="badge badge-exchanged">交换成功</span>
            <span class="exchange-time">{{ formatDateTime(exc.createdAt) }}</span>
          </div>
        </div>

        <div class="items-row">
          <div class="item-col my-item">
            <p class="item-label">我的物品</p>
            <div v-if="exc.myItem" class="item-info">
              <img :src="appendAuth(exc.myItem.image)" class="item-img"/>
              <div class="item-detail">
                <p class="item-name">{{ exc.myItem.realName }}</p>
                <p class="item-tags">
                  {{ exc.myItem.mysteryTags ? exc.myItem.mysteryTags.join(', ') : '' }}
                </p>
              </div>
            </div>
          </div>

          <div class="exchange-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 16l-4-4m0 0l4-4m-4 4h18"/>
              <path d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </div>

          <div class="item-col other-item">
            <p class="item-label">对方物品</p>
            <div v-if="exc.otherItem" class="item-info">
              <img :src="appendAuth(exc.otherItem.image)" class="item-img"/>
              <div class="item-detail">
                <p class="item-name">{{ exc.otherItem.realName }}</p>
                <p class="item-tags">{{ exc.otherItem.ownerName }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="exc.otherContact" class="contact-box">
          <p class="contact-label">对方联系方式</p>
          <p class="contact-value">{{ exc.otherContact }}</p>
        </div>

        <div v-if="exc.appointment && exc.appointment.status === 'scheduled'" class="appointment-card appointment-active">
          <div class="appointment-header">
            <div class="appointment-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div class="appointment-title">
              <span class="badge badge-appointment">面交预约</span>
              <span class="appointment-status">待赴约</span>
            </div>
          </div>

          <div class="appointment-details">
            <div class="appt-row">
              <span class="appt-icon">📍</span>
              <div class="appt-content">
                <p class="appt-label">约定地点</p>
                <p class="appt-value">{{ exc.appointment.location }}</p>
              </div>
            </div>
            <div class="appt-row">
              <span class="appt-icon">🕐</span>
              <div class="appt-content">
                <p class="appt-label">约定时间</p>
                <p class="appt-value">{{ formatApptTime(exc.appointment.time) }}</p>
              </div>
            </div>
            <div v-if="exc.appointment.contactNote" class="appt-row">
              <span class="appt-icon">👤</span>
              <div class="appt-content">
                <p class="appt-label">联系人备注</p>
                <p class="appt-value">{{ exc.appointment.contactNote }}</p>
              </div>
            </div>
            <div v-if="exc.appointment.reminder" class="appt-row">
              <span class="appt-icon">💡</span>
              <div class="appt-content">
                <p class="appt-label">提醒说明</p>
                <p class="appt-value">{{ exc.appointment.reminder }}</p>
              </div>
            </div>
          </div>

          <div class="appointment-actions">
            <button class="btn btn-secondary btn-sm" @click="openEditModal(exc)">修改预约</button>
            <button class="btn btn-danger btn-sm" @click="handleCancelAppointment(exc)">取消预约</button>
          </div>
        </div>

        <div v-else-if="exc.appointment && exc.appointment.status === 'cancelled'" class="appointment-card appointment-cancelled">
          <div class="appointment-header">
            <div class="appointment-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div class="appointment-title">
              <span class="badge badge-cancelled">预约已取消</span>
              <span class="appointment-time-cancelled">取消于 {{ formatDateTime(exc.appointment.cancelledAt) }}</span>
            </div>
          </div>

          <div class="appointment-details">
            <div class="appt-row">
              <span class="appt-icon">📍</span>
              <div class="appt-content">
                <p class="appt-label">原约定地点</p>
                <p class="appt-value appt-value-cancelled">{{ exc.appointment.location }}</p>
              </div>
            </div>
            <div class="appt-row">
              <span class="appt-icon">🕐</span>
              <div class="appt-content">
                <p class="appt-label">原约定时间</p>
                <p class="appt-value appt-value-cancelled">{{ formatApptTime(exc.appointment.time) }}</p>
              </div>
            </div>
          </div>

          <div class="appointment-actions">
            <button class="btn btn-primary btn-sm" @click="openEditModal(exc)">重新预约</button>
          </div>
        </div>

        <div v-else class="no-appointment">
          <div class="no-appt-icon">📅</div>
          <div class="no-appt-text">
            <p>还没有面交预约</p>
            <span>约个时间地点，方便双方当面交换</span>
          </div>
          <button class="btn btn-primary btn-sm" @click="openEditModal(exc)">发起预约</button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditing ? '修改面交预约' : '发起面交预约' }}</h3>
          <button class="modal-close" @click="closeModal">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>约定地点 <span class="required">*</span></label>
            <input v-model="formData.location" type="text" placeholder="例如：星巴克咖啡厅（人民广场店）"/>
          </div>

          <div class="form-group">
            <label>约定时间 <span class="required">*</span></label>
            <input v-model="formData.time" type="datetime-local"/>
          </div>

          <div class="form-group">
            <label>联系人备注</label>
            <input v-model="formData.contactNote" type="text" placeholder="例如：穿蓝色外套，戴黑框眼镜"/>
          </div>

          <div class="form-group">
            <label>提醒说明</label>
            <textarea v-model="formData.reminder" rows="3" placeholder="例如：请记得带好物品，准时到达"></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="handleSaveAppointment" :disabled="saving">
            {{ saving ? '保存中...' : '保存预约' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMyExchanges, appendAuth, updateAppointment, cancelAppointment } from '../api/index.js'
import { userStore } from '../store/user.js'

const exchanges = ref([])
const loading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const currentExchangeId = ref('')
const saving = ref(false)

const formData = ref({
  location: '',
  time: '',
  contactNote: '',
  reminder: ''
})

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return y + '-' + m + '-' + d + ' ' + h + ':' + min
}

function formatDateTime(dateStr) {
  return formatDate(dateStr)
}

function formatDay(dateStr) {
  const date = new Date(dateStr)
  return String(date.getDate()).padStart(2, '0')
}

function formatMonth(dateStr) {
  const date = new Date(dateStr)
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  return months[date.getMonth()]
}

function formatApptTime(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[date.getDay()]
  return `${y}年${m}月${d}日 ${weekDay} ${h}:${min}`
}

async function loadExchanges() {
  loading.value = true
  try {
    exchanges.value = await getMyExchanges(userStore.user.id)
  } catch (e) {
    alert('加载失败')
  } finally {
    loading.value = false
  }
}

function openEditModal(exc) {
  currentExchangeId.value = exc.id
  if (exc.appointment && exc.appointment.status === 'scheduled') {
    isEditing.value = true
    formData.value = {
      location: exc.appointment.location,
      time: exc.appointment.time ? exc.appointment.time.slice(0, 16) : '',
      contactNote: exc.appointment.contactNote || '',
      reminder: exc.appointment.reminder || ''
    }
  } else {
    isEditing.value = false
    formData.value = {
      location: '',
      time: '',
      contactNote: '',
      reminder: ''
    }
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  formData.value = {
    location: '',
    time: '',
    contactNote: '',
    reminder: ''
  }
}

async function handleSaveAppointment() {
  if (!formData.value.location || !formData.value.time) {
    alert('请填写地点和时间')
    return
  }

  saving.value = true
  try {
    await updateAppointment(currentExchangeId.value, {
      userId: userStore.user.id,
      location: formData.value.location,
      time: formData.value.time,
      contactNote: formData.value.contactNote,
      reminder: formData.value.reminder
    })
    alert('预约保存成功！')
    closeModal()
    loadExchanges()
  } catch (e) {
    alert('保存失败：' + (e.response && e.response.data ? e.response.data.error : e.message))
  } finally {
    saving.value = false
  }
}

async function handleCancelAppointment(exc) {
  if (!confirm('确定要取消这个面交预约吗？')) {
    return
  }

  try {
    await cancelAppointment(exc.id, userStore.user.id)
    alert('预约已取消')
    loadExchanges()
  } catch (e) {
    alert('取消失败：' + (e.response && e.response.data ? e.response.data.error : e.message))
  }
}

onMounted(loadExchanges)
</script>

<style scoped>
.exchange-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.exchange-card {
  position: relative;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.card-date {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.date-day {
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
}

.date-month {
  font-size: 12px;
  margin-top: 2px;
}

.card-title {
  flex: 1;
}

.card-title .badge {
  margin-bottom: 6px;
  display: inline-block;
}

.exchange-time {
  font-size: 13px;
  color: #999;
}

.items-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.item-col {
  flex: 1;
}

.item-label {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #667eea;
}

.other-item .item-label {
  color: #f5576c;
  text-align: right;
}

.item-info {
  display: flex;
  gap: 10px;
  align-items: center;
}

.other-item .item-info {
  flex-direction: row-reverse;
}

.item-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.item-detail {
  flex: 1;
  min-width: 0;
}

.other-item .item-detail {
  text-align: right;
}

.item-name {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-tags {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.exchange-icon {
  color: #667eea;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-box {
  background: #eef2ff;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 16px;
}

.contact-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.contact-value {
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
}

.appointment-card {
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}

.appointment-active {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border: 1px solid #a5d6a7;
}

.appointment-cancelled {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
}

.appointment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.appointment-icon {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4caf50;
}

.appointment-cancelled .appointment-icon {
  color: #999;
}

.appointment-title {
  flex: 1;
}

.badge-appointment {
  background: #c8e6c9;
  color: #2e7d32;
  margin-bottom: 4px;
  display: inline-block;
}

.badge-cancelled {
  background: #e0e0e0;
  color: #757575;
  margin-bottom: 4px;
  display: inline-block;
}

.appointment-status {
  font-size: 13px;
  color: #2e7d32;
  font-weight: 500;
}

.appointment-time-cancelled {
  font-size: 12px;
  color: #999;
}

.appointment-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.appt-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.appt-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.appt-content {
  flex: 1;
  min-width: 0;
}

.appt-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.appt-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  word-break: break-all;
}

.appt-value-cancelled {
  color: #999;
  text-decoration: line-through;
}

.appointment-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.5);
}

.appointment-cancelled .appointment-actions {
  border-top: 1px solid #e0e0e0;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
  flex: 1;
}

.no-appointment {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
  border: 1px dashed #d0d0d0;
}

.no-appt-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.no-appt-text {
  flex: 1;
}

.no-appt-text p {
  font-weight: 500;
  margin-bottom: 2px;
}

.no-appt-text span {
  font-size: 12px;
  color: #999;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  font-size: 18px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
}

.modal-footer .btn {
  flex: 1;
}

.required {
  color: #f5576c;
}

textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}
</style>
